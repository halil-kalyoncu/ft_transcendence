import { SubscribeMessage, WebSocketGateway, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { GameService } from '../../service/game.service';
import { Room } from '../../service/room.service';
import { PowerUp } from 'src/game/service/powerup.service';

let ballPos = {x: 0, y: 0};


@WebSocketGateway({
	cors: {
	  origin: ["http://localhost:4200", "http://localhost:3000"]
	},
	namespace: 'game'
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
					let newBallPos = room.ball.moveBall(room, this.server);
					// for (let powerup of room.powerups){
					// 	powerup.moveDown();
					// 	this.server.emit('powerUpMove', {id: powerup.id, y: powerup.y});
					// }
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

		@SubscribeMessage('spawnPowerUp')
		createPowerUp(client: any, data: { 
			id: number,
			x: number,
			y: number,
			speed: number,
			type: number,
			wid: number,
			hgt: number,
			color: string;
		}): void {
			const room = this.rooms.get("test");
			data.speed = 3;
			// data.color = "blue";
			const newPowerUp = new PowerUp(data.id, data.x, data.y, data.speed, data.type, data.wid, data.hgt, data.color);
			room.powerups.push(newPowerUp);
			this.server.emit('newPowerUp', data);
			// console.log("powerup spawned at x: ", data.x)
		}

		@SubscribeMessage('activatePowerUp')
		activatePowerUp(client: any, data: {
			type: string,
			player: string
		}): void {
			if (data.type == "increasePaddle")
			{
				const room = this.rooms.get("test");
				room.paddleA.setHeight(400);
				this.server.emit('newPaddleHeight', { player: "left", hgt: 400 });
				console.log("increase Pad");
			}
			// console.log(data.type, data.player);
		}
		@SubscribeMessage('removePowerUp')
		removePowerUp(client: any, id: number){
			const room = this.rooms.get("test");
			let index = room.powerups.findIndex(powerup => powerup.id == id);
			console.log("index: ", index)
			if (index != -1) {
				room.powerups.splice(index, 1);
			}
		}
	}
