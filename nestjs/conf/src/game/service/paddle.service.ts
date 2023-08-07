import { Injectable } from "@nestjs/common";

@Injectable()
export class Paddle{
	constructor(
		public x: number = 1,
		public y: number = 100,
		public wid: number = 15,
		public hgt: number = 100,
		public speed: number = 7,
		public fieldWidth: number = 800,
		public fieldHeight: number = 600
		) {}
		
		movePaddleUp() {
			if (this.y > this.speed)
				this.y -= this.speed;
			else
				this.y = 0;
			
			let data = {
				x: this.x,
				y: this.y,
				wid: this.wid,
				hgt: this.hgt
			};
			return data;
		}
		
		movePaddleDown() {
			if (this.y >= (this.fieldHeight - this.hgt - 1))
				this.y = this.fieldHeight - this.hgt;
			else
				this.y += this.speed;
			
			let data = {
				x: this.x,
				y: this.y,
				wid: this.wid,
				hgt: this.hgt
			};
			return data;
		}
		
		
		setPaddlePosition(x: number, y: number) {
			this.x = x;
			this.y = y;
		}
	}