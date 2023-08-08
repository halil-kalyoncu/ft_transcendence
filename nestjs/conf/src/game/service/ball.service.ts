import { Injectable } from "@nestjs/common";
import { Room } from "./room.service";
import { Server } from 'socket.io';
import { PowerUp } from "./powerup.service";

//500, 200, 15, 15, 5, 4, 3, 800, 600
@Injectable()
export class Ball {
	
	constructor (
		public x: number = 500, 
		public y: number = 200, 
		public wid: number = 15, 
		public hgt: number = 15, 
		public speed: number = 2, 
		public dx: number = 4, 
		public dy: number = 3,
		public fieldWidth: number = 800,
		public fieldHeight: number = 600,
		) {	}
		
		getBallPosition() {
			return {
				x: this.x,
				y: this.y
			};
		}
		
		resetBall() {
			this.x = this.fieldWidth / 2 - (this.wid / 2);
			this.y = this.fieldHeight / 2 - (this.hgt / 2);
			this.dx = 5;
			this.dy = 3;
			this.speed = 3;
		}
		
		moveBallDir(paddleBY: number, paddleHeight: number, paddle: string): void {
			let paddleMid = paddleBY + (paddleHeight / 2);
			let ballMid = this.y + (this.hgt / 2);
			let paddleHitLocation = (ballMid - paddleMid) / (paddleHeight / 2);
			let bounceAngle = (paddleHitLocation * 45) * Math.PI / 180;
			
			if (paddle == "A")
				this.dx = -this.speed * Math.cos(bounceAngle);
			else
				this.dx = this.speed * Math.cos(bounceAngle);
				this.dy = this.speed * Math.sin(bounceAngle);
				this.dx = -this.dx;
			
			this.speed++;
		}
		
		handleBallCollision(nextBallX: number, nextBallY: number, room: Room, paddle: string) {
			if (paddle == "A"){
				if ((nextBallX < room.paddleA.x + room.paddleA.hgt) &&
				(nextBallY + this.hgt >= room.paddleA.y) &&
				(nextBallY < room.paddleA.y + room.paddleA.hgt))
					return true;
				return false;
			}
			else {
				if ((nextBallX + this.wid >= room.paddleB.x) && 
				(nextBallY <= room.paddleB.y + room.paddleB.hgt) &&
				(nextBallY + this.hgt >= room.paddleB.y))
					return true;
				return false;
			}
		}

		handlePowerUpCollision(nextBallX: number, nextBallY: number, powerup: PowerUp){

			if ((nextBallX + this.wid >= powerup.x && nextBallX < powerup.x + powerup.wid ||
				nextBallX <= powerup.x + powerup.wid && nextBallX + this.wid > powerup.x) &&
				(nextBallY + this.hgt >= powerup.y && nextBallY < powerup.y + powerup.hgt ||
				nextBallY <= powerup.y + powerup.hgt && nextBallY + this.hgt > powerup.y)){
				return true;
			}
			return false;
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
				powerup.moveDown();
				if (this.handlePowerUpCollision(nextBallX, nextBallY, powerup)){
					console.log("powerupid: ", powerup.id)
					server.emit('destroyPowerUp', {id: powerup.id});
				}
				else
					server.emit('powerUpMove', {id: powerup.id, y: powerup.y});
			}
			return {
				x: this.x,
				y: this.y
			};
		}
	}
	
