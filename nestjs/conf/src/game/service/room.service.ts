import { Injectable } from '@nestjs/common';
import { Ball } from './ball.service';
import { Paddle } from './paddle.service';
import { PowerUp } from './powerup.service';

@Injectable()
export class Room {
  id: number;
  ball: Ball;
  paddleA: Paddle;
  paddleB: Paddle;
  //players: Map<string, string>;
  powerups: PowerUp[];
  gameIsRunning: boolean;

  goalsToWin: number;
  socketIds: string[];

  leftPlayerId: number;
  rightPlayerId: number;

  leftPlayerGoals: number;
  rightPlayerGoals: number;

  leftPlayerDisconnect: boolean;
  rightPlayerDisconnect: boolean;

  comeback: string;
  firstGoal: string;

  powerupInterval: any;
  diffPadBall: number;

  constructor(
    id: number,
    goalsToWin: number,
    leftPlayerId: number,
    rightPlayerId: number,
  ) {
    this.id = id;
    this.goalsToWin = goalsToWin;
    this.ball = new Ball(500, 200, 15, 15, 5, 4, 3, 800, 600);
    this.paddleA = new Paddle(1, 100, 15, 100, 7, 800, 600);
    this.paddleB = new Paddle(785, 100, 15, 100, 7, 800, 600);
    //this.players = new Map();
    this.leftPlayerId = leftPlayerId;
    this.rightPlayerId = rightPlayerId;
    this.powerups = [];
    this.socketIds = ['', ''];
    this.gameIsRunning = true;

    this.leftPlayerGoals = 0;
    this.rightPlayerGoals = 0;

    this.comeback = 'NONE';
    this.firstGoal = 'NONE';

    this.powerupInterval = null;
    this.diffPadBall = 0;
  }

  checkGameFinished(): void {
    if (
      this.leftPlayerGoals === this.goalsToWin ||
      this.rightPlayerGoals === this.goalsToWin
    ) {
      this.gameIsRunning = false;
    }
  }
}
