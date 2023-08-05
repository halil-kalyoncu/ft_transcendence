import { Injectable } from "@nestjs/common";

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
		
		handleBallCollision(nextBallX: number, nextBallY: number, paddleX: number, paddleY: number, paddleWidth: number, paddleHeight: number, paddle: string) {
			if (paddle == "A"){
				if ((nextBallX < paddleX + paddleWidth) &&
				(nextBallY + this.hgt >= paddleY) &&
				(nextBallY < paddleY + paddleHeight))
					return true;
				return false;
			}
			else {
				if ((nextBallX + this.wid >= paddleX) && 
				(nextBallY <= paddleY + paddleHeight) &&
				(nextBallY + this.hgt >= paddleY))
					return true;
				return false;
			}
		}

		moveBall(paddleAX: number, paddleAY: number, paddleBX: number, paddleBY: number, paddleWidth: number, paddleHeight: number) {
			let nextBallX = this.x + this.dx;
			let nextBallY = this.y + this.dy;
			
			if (((nextBallX <= 0) && nextBallX < this.x) || (nextBallX + this.wid > this.fieldWidth && nextBallX > this.x))
				this.resetBall();
			
			else if (nextBallX + this.wid > this.fieldWidth)
				this.dx = -this.dx;
			
			else if (nextBallY + this.hgt > this.fieldHeight || nextBallY < 0)
				this.dy = -this.dy;
			
			else if (this.handleBallCollision(nextBallX, nextBallY, paddleAX, paddleAY, paddleWidth, paddleHeight, "A")){
				this.moveBallDir(paddleAY, paddleHeight, "A");
				this.x = paddleAX + paddleWidth;
			}
			
			else if (this.handleBallCollision(nextBallX, nextBallY, paddleBX, paddleBY, paddleWidth, paddleHeight, "B")){
				this.moveBallDir(paddleBY, paddleHeight, "B");
				this.x = paddleBX - this.wid;
			}
			else {
				this.x = nextBallX;
				this.y = nextBallY;
			}
			
			return {
				x: this.x,
				y: this.y
			};
		}
	}
	
