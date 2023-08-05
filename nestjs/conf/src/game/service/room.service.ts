import { Injectable } from "@nestjs/common";
import { Ball } from "./ball.service";
import { Paddle } from "./paddle.service";

@Injectable()
export class Room {
	id: string;
	ball: Ball;
	paddleA: Paddle;
	paddleB: Paddle;
	players: Map<string, string>;

	constructor(id: string) {
		this.id = id;
		this.ball = new Ball(500, 200, 15, 15, 5, 4, 3, 800, 600)
		this.paddleA = new Paddle(1, 100, 15, 100, 7, 800, 600);
		this.paddleB = new Paddle(785, 100, 15, 100, 7, 800, 600);
		this.players = new Map();
	}

}