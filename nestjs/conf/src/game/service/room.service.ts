import { Injectable } from "@nestjs/common";
import { Ball } from "./ball.service";
import { Paddle } from "./paddle.service";
import { PowerUp } from "./powerup.service";

@Injectable()
export class Room {
	id: number;
	ball: Ball;
	paddleA: Paddle;
	paddleB: Paddle;
	//players: Map<string, string>;
	powerups: PowerUp[];
	gameIsRunning: boolean;

	socketIds: string[];
	leftPlayerGoals: number;
	rightPlayerGoals: number;
	leftPlayerDisconnect: boolean;
	rightPlayerDisconnect: boolean;

	constructor(id: number) {
		this.id = id;
		this.ball = new Ball(500, 200, 15, 15, 5, 4, 3, 800, 600)
		this.paddleA = new Paddle(1, 100, 15, 100, 7, 800, 600);
		this.paddleB = new Paddle(785, 100, 15, 100, 7, 800, 600);
		//this.players = new Map();
		this.powerups = [];
		this.socketIds = ['', ''];
		this.gameIsRunning = true;

		this.leftPlayerGoals = 0;
		this.rightPlayerGoals = 0;
	}

}