import { Injectable } from '@nestjs/common';
import { Room } from './room.service';
import { Server } from 'socket.io';
import { PowerUp } from './powerup.service';

@Injectable()
export class Ball {
  constructor(
    public x: number = 500,
    public y: number = 200,
    public wid: number = 15,
    public hgt: number = 15,
    public speed: number = 4,
    public dx: number = 5,
    public dy: number = 3,
    public fieldWidth: number = 800,
    public fieldHeight: number = 600,
    public magnet: number = 0,
    public ballSticking: number = 0,
    public magdiff: number = 0,
    public pause: boolean = false,
    public timeoutId: any = null,
  ) {}

  getBallPosition() {
    return {
      x: this.x,
      y: this.y,
    };
  }

  resetBall() {
    this.x = this.fieldWidth / 2 - this.wid / 2;
    this.y = this.fieldHeight / 2 - this.hgt / 2;
    this.dx = 5 * (Math.random() < 0.5 ? 1 : -1);
    this.dy = 3 * (Math.random() < 0.5 ? 1 : -1);
    this.speed = 4;
    this.pause = true;
  }

  moveBallDir(paddleBY: number, paddleHeight: number, paddle: string): void {
    let paddleMid = paddleBY + paddleHeight / 2;
    let ballMid = this.y + this.hgt / 2;
    let paddleHitLocation = (ballMid - paddleMid) / (paddleHeight / 2);
    let bounceAngle = (paddleHitLocation * 45 * Math.PI) / 180;

    this.speed++;

    if (paddle == 'A') this.dx = -this.speed * Math.cos(bounceAngle);
    else this.dx = this.speed * Math.cos(bounceAngle);

    this.dy = this.speed * Math.sin(bounceAngle);
    this.dx = -this.dx;
  }

  changeSpeed(steps: number): void {
    const oldSpeed = this.speed;

    if (this.speed + steps < 1) {
      this.speed = 1;
      return;
    }
    this.speed += steps;

    const speedFaktor = this.speed / oldSpeed;
    this.dx *= speedFaktor;
    this.dy *= speedFaktor;
  }

  handleBallCollision(
    nextBallX: number,
    nextBallY: number,
    room: Room,
    paddle: string,
  ) {
    if (paddle == 'A') {
      if (
        nextBallX < room.paddleA.x + room.paddleA.wid &&
        nextBallY + this.hgt >= room.paddleA.y &&
        nextBallY < room.paddleA.y + room.paddleA.hgt
      )
        return true;
      return false;
    } else {
      if (
        nextBallX + this.wid >= room.paddleB.x &&
        nextBallY <= room.paddleB.y + room.paddleB.hgt &&
        nextBallY + this.hgt >= room.paddleB.y
      )
        return true;
      return false;
    }
  }

  handlePowerUpCollision(
    nextBallX: number,
    nextBallY: number,
    powerup: PowerUp,
  ) {
    if (
      ((nextBallX + this.wid >= powerup.x &&
        nextBallX <= powerup.x + powerup.wid) ||
        (nextBallX <= powerup.x + powerup.wid &&
          nextBallX + this.wid >= powerup.x)) &&
      ((nextBallY + this.hgt >= powerup.y &&
        nextBallY <= powerup.y + powerup.hgt) ||
        (nextBallY <= powerup.y + powerup.hgt &&
          nextBallY + this.hgt >= powerup.y))
    ) {
      return true;
    }
    return false;
  }

  scoreGoal(room: Room, nextBallX: number, server: Server): boolean {
    let scoredGoal = false;

    if (nextBallX <= 0 && nextBallX < this.x) {
      room.rightPlayerGoals++;
      server.to(room.socketIds[0]).emit('scoreGoal', 'playerB');
      server.to(room.socketIds[1]).emit('scoreGoal', 'playerB');

      scoredGoal = true;
      if (room.rightPlayerGoals == 1 && room.leftPlayerGoals == 0)
        room.firstGoal = 'RIGHT';
      if (
        room.comeback == 'NONE' &&
        room.rightPlayerGoals - room.leftPlayerGoals > room.goalsToWin / 2
      )
        room.comeback = 'LEFT';
    } else if (nextBallX + this.wid > this.fieldWidth && nextBallX > this.x) {
      server.to(room.socketIds[0]).emit('scoreGoal', 'playerA');
      server.to(room.socketIds[1]).emit('scoreGoal', 'playerA');
      room.leftPlayerGoals++;
      scoredGoal = true;
      if (room.leftPlayerGoals == 1 && room.rightPlayerGoals == 0)
        room.firstGoal = 'LEFT';
      if (
        room.comeback == 'NONE' &&
        room.leftPlayerGoals - room.rightPlayerGoals > room.goalsToWin / 2
      )
        room.comeback = 'RIGHT';
    }

    if (scoredGoal) {
      room.checkGameFinished();
    }
    return scoredGoal;
  }

  moveBall(room: Room, server: Server) {
    let nextBallX = this.x + this.dx;
    let nextBallY = this.y + this.dy;

    for (let powerup of room.powerups) {
      if (this.handlePowerUpCollision(nextBallX, nextBallY, powerup)) {
        let target;
        if (this.dx > 0) target = 'left';
        else target = 'right';
        const activatePowerUpData = {
          player: target,
          type: powerup.type,
        };
        let index = room.powerups.findIndex((pow) => pow.id == powerup.id);
        if (index == -1) {
          return;
        }
        room.powerups.splice(index, 1);
        server
          .to(room.socketIds[0])
          .emit('activatePowerUp', activatePowerUpData);
        server
          .to(room.socketIds[1])
          .emit('activatePowerUp', activatePowerUpData);
        server.to(room.socketIds[0]).emit('destroyPowerUp', { id: powerup.id });
        server.to(room.socketIds[1]).emit('destroyPowerUp', { id: powerup.id });
      }
      if (
        powerup.y + powerup.hgt >= this.fieldHeight &&
        !this.handlePowerUpCollision(nextBallX, nextBallY, powerup)
      ) {
        server.to(room.socketIds[0]).emit('destroyPowerUp', { id: powerup.id });
        server.to(room.socketIds[1]).emit('destroyPowerUp', { id: powerup.id });
      }
    }

    if (this.scoreGoal(room, nextBallX, server)) {
      room.paddleA.resetHeight();
      room.paddleB.resetHeight();
      server.to(room.socketIds[0]).emit('resetPaddle');
      server.to(room.socketIds[1]).emit('resetPaddle');
      this.resetBall();
      this.pause = true;
      if (this.timeoutId) {
        clearTimeout(this.timeoutId);
      }
      this.timeoutId = setTimeout(() => {
        this.pause = false;
      }, 3000);
    } else if (nextBallX + this.wid > this.fieldWidth) this.dx = -this.dx;
    else if (nextBallY + this.hgt > this.fieldHeight || nextBallY < 0)
      this.dy = -this.dy;
    else if (this.handleBallCollision(nextBallX, nextBallY, room, 'A')) {
      if (this.magnet == 1) {
        this.ballSticking = 1;
        return;
      }
      this.moveBallDir(room.paddleA.y, room.paddleA.hgt, 'A');
      this.x = room.paddleA.x + room.paddleA.wid;
    } else if (this.handleBallCollision(nextBallX, nextBallY, room, 'B')) {
      if (this.magnet == 2) {
        this.ballSticking = 2;
        return;
      }
      this.moveBallDir(room.paddleB.y, room.paddleB.hgt, 'B');
      this.x = room.paddleB.x - this.wid;
    } else {
      this.x = nextBallX;
      this.y = nextBallY;
    }

    return {
      x: this.x,
      y: this.y,
    };
  }
}
