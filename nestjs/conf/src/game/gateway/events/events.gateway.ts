import { SubscribeMessage, WebSocketGateway, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { GameService } from '../../service/game.service';
import { Room } from '../../service/room.service';

let ballPos = {x: 0, y: 0};


@WebSocketGateway({
	cors: {
	  origin: "http://localhost:4200",
	  methods: ["GET", "POST"],
	  allowedHeaders: ["authorization"],
	  credentials: true
	}
  })
  export class EventsGateway {
	
	constructor(
		private gameService: GameService,
		) {
			this.rooms.set("test", new Room("test"));
			this.startGame();
		}
		
		server: Server;
		
		gameIsRunning = false;
		rooms = new Map<string, Room>();
		players = new Map<string, string>();
		
		startGame() {
			this.gameIsRunning = true;
			setInterval(() => {
				if (this.gameIsRunning) {
					let room = this.rooms.get("test");
					let newBallPos = room.ball.moveBall(room.paddleA.x, room.paddleA.y,
					room.paddleB.x, room.paddleB.y,
					room.paddleA.wid, room.paddleA.hgt);
					this.server.emit('ballPosition', newBallPos);
				}
			}, 15);
		}
		
		afterInit(server: Server) {
			this.server = server;
			console.log('Server is ready');
		}
		
		handleConnection(client: any, ...args: any[]) {
			if (!this.players.has(client.id))
			{
				if (this.players.size < 1)
				{
					this.players.set(client.id, "left");
					client.emit('direction', 'left');
				}
				else
				{
					this.players.set(client.id, "right");
					client.emit('direction', 'right');
					client.broadcast.emit('startGame');
					client.emit('startGame');
				}
			}
			console.log(`Client connected: ${client.id}`);
		}
		
		handleDisconnect(client: any) {
			this.players.delete(client.id);
			console.log(`Client disconnected: ${client.id}`);
		}
		
		resetGame() {
			this.gameIsRunning = false;
			console.log("HERE");
			this.rooms.get("test").ball.resetBall();
			this.server.emit('ballPosition', this.rooms.get("test").ball.getBallPosition());
		}
		
		@SubscribeMessage('message')
		handleMessage(client: any, payload: any): string {
			return 'Hello world!';
		}
		
		@SubscribeMessage('paddleMove')
		handlePaddleMove(client: any, data: { 
			playerId: string,
			direction: string
		}): void {
			if (this.players.get(client.id) == "left"){
				let paddleAPos = {x: 0, y: 0, wid: 0, hgt: 0};

				if (data.direction == "up")
					paddleAPos = this.rooms.get("test").paddleA.movePaddleUp();
				else
					paddleAPos = this.rooms.get("test").paddleA.movePaddleDown();

				this.server.emit('paddleMove', { playerId: this.players.get(client.id), newPos: paddleAPos.y });
			}
			if (this.players.get(client.id) == "right"){
				let paddleBPos = {x: 0, y: 0, wid: 0, hgt: 0};

				if (data.direction == "up")
					paddleBPos = this.rooms.get("test").paddleB.movePaddleUp();
				else
					paddleBPos = this.rooms.get("test").paddleB.movePaddleDown();

				this.server.emit('paddleMove', { playerId: this.players.get(client.id), newPos: paddleBPos.y });
			}
			return;
		}
		
		@SubscribeMessage('ballX')
		updateBallX(client: any, ballX: number): void {
			ballPos.x = ballX;
			client.broadcast.emit('ballX', ballPos.x);
		}
		
		@SubscribeMessage('ballY')
		updateBallY(client: any, ballY: number): void {
			ballPos.y = ballY;
			client.broadcast.emit('ballY', ballPos.y);
		}
		
		@SubscribeMessage('start')
		sendStartMessage(client: any): void {
			client.broadcast.emit('startGame');
			console.log("start");
		}
	}
