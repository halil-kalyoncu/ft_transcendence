import { Injectable } from '@nestjs/common';
import { Room } from './room.service';
import { Server } from 'socket.io';
import { PowerUp } from './powerup.service';

//500, 200, 15, 15, 5, 4, 3, 800, 600
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
    public magnet: boolean = false,
    public ballSticking: boolean = false,
    public magdiff: number = 0,
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
    this.dx = 5;
    this.dy = 3;
    this.speed = 4;
    this.magnet = false;
  }

  moveBallDir(paddleBY: number, paddleHeight: number, paddle: string): void {
    let paddleMid = paddleBY + paddleHeight / 2;
    let ballMid = this.y + this.hgt / 2;
    let paddleHitLocation = (ballMid - paddleMid) / (paddleHeight / 2);
    let bounceAngle = (paddleHitLocation * 45 * Math.PI) / 180;

    this.speed++;
    // console.log("Speed", this.speed);

    if (paddle == 'A') this.dx = -this.speed * Math.cos(bounceAngle);
    else this.dx = this.speed * Math.cos(bounceAngle);

    this.dy = this.speed * Math.sin(bounceAngle);
    this.dx = -this.dx;
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

  scoreGoal(room: Room, nextBallX: number): boolean {
    let scoredGoal = false;

    if (nextBallX <= 0 && nextBallX < this.x) {
      room.rightPlayerGoals++;
      // this.magdiff = this.y - padd
      scoredGoal = true;
    } else if (nextBallX + this.wid > this.fieldWidth && nextBallX > this.x) {
      room.leftPlayerGoals++;
      scoredGoal = true;
    }
    if (scoredGoal) {
      room.checkGameFinished();
    }
    return scoredGoal;
  }

  moveBall(room: Room, server: Server) {
    let nextBallX = this.x + this.dx;
    let nextBallY = this.y + this.dy;

    if (this.scoreGoal(room, nextBallX)) this.resetBall();
    else if (nextBallX + this.wid > this.fieldWidth) this.dx = -this.dx;
    else if (nextBallY + this.hgt > this.fieldHeight || nextBallY < 0)
      this.dy = -this.dy;
    else if (this.handleBallCollision(nextBallX, nextBallY, room, 'A')) {
      if (this.magnet) {
        this.ballSticking = true;
        // console.log("DIFFERENCE: ", this.y)
        return;
      }
      this.moveBallDir(room.paddleA.y, room.paddleA.hgt, 'A');
      this.x = room.paddleA.x + room.paddleA.wid;
    } else if (this.handleBallCollision(nextBallX, nextBallY, room, 'B')) {
      if (this.magnet) {
        this.ballSticking = true;
        return;
      }
      this.moveBallDir(room.paddleB.y, room.paddleB.hgt, 'B');
      this.x = room.paddleB.x - this.wid;
    } else {
      this.x = nextBallX;
      this.y = nextBallY;
    }

    for (let powerup of room.powerups) {
      // console.log(this.dx);
      if (this.handlePowerUpCollision(nextBallX, nextBallY, powerup)) {
        let target;
        if (this.dx > 0) target = 'left';
        else target = 'right';

        server.emit('activatePowerUp', {
          player: target,
          type: 'increasePaddleHeight',
        });
        server.emit('destroyPowerUp', { id: powerup.id });
      }
      if (
        powerup.y + powerup.hgt >= this.fieldHeight &&
        !this.handlePowerUpCollision(nextBallX, nextBallY, powerup)
      ) {
        console.log('powerupid: ', powerup.id);
        server.emit('destroyPowerUp', { id: powerup.id });
      } else {
        powerup.moveDown();
        server.emit('powerUpMove', { id: powerup.id, y: powerup.y });
      }
    }
    return {
      x: this.x,
      y: this.y,
    };
  }
}
