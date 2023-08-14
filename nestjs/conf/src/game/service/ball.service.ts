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
    public speed: number = 2,
    public dx: number = 4,
    public dy: number = 3,
    public fieldWidth: number = 800,
    public fieldHeight: number = 600,
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
    this.speed = 3;
  }

		moveBall(room: Room, server: Server) {
			let nextBallX = this.x + this.dx;
			let nextBallY = this.y + this.dy;
			
			if (((nextBallX <= 0) && nextBallX < this.x) || (nextBallX + this.wid > this.fieldWidth && nextBallX > this.x))
				this.resetBall();
			
			else if (nextBallX + this.wid > this.fieldWidth)
				this.dx = -this.dx;
			
			else if (nextBallY + this.hgt > this.fieldHeight || nextBallY < 0)
				this.dy = -this.dy;
			
			else if (this.handleBallCollision(nextBallX, nextBallY, room, "A")){
				this.moveBallDir(room.paddleA.y, room.paddleA.hgt, "A");
				this.x = room.paddleA.x + room.paddleA.hgt;
			}
			
			else if (this.handleBallCollision(nextBallX, nextBallY, room, "B")){
				this.moveBallDir(room.paddleB.y, room.paddleB.hgt, "B");
				this.x = room.paddleB.x - this.wid;
			}
			else {
				this.x = nextBallX;
				this.y = nextBallY;
			}
			for (let powerup of room.powerups){
				if (this.handlePowerUpCollision(nextBallX, nextBallY, powerup)){
					server.emit('destroyPowerUp', {id: powerup.id});
				}
				if (powerup.y + powerup.hgt >= this.fieldHeight && !this.handlePowerUpCollision(nextBallX, nextBallY, powerup)){
					console.log("powerupid: ", powerup.id);
					server.emit('destroyPowerUp', {id: powerup.id});
				}
				else {
					powerup.moveDown();
					server.emit('powerUpMove', {id: powerup.id, y: powerup.y});
				}
			}
			return {
				x: this.x,
				y: this.y
			};
		}
	}
	
