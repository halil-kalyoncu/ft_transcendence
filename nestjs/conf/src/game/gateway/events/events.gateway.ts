import { SubscribeMessage, WebSocketGateway, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameService } from '../../service/game.service';
import { Room } from '../../service/room.service';
import { PowerUp } from 'src/game/service/powerup.service';
import { MatchService } from '../../../match/service/match.service';
import { UserService } from '../../../user/service/user-service/user.service';

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
		private userService: UserService,
		private matchService: MatchService
		) {
			// this.rooms.set("test", new Room("test"));
			// this.startGame();
		}

		@WebSocketServer()
		server: Server;

		// gameIsRunning = false; -> individual game has to know if is running
		rooms = new Map<number, Room>();
		// players = new Map<string, string>(); -> individual socket holds information if it is the left or right player

		startGame(room: Room) {
			setInterval(() => {
				if (room.gameIsRunning) {
					let newBallPos = room.ball.moveBall(room, this.server);
					// for (let powerup of room.powerups){
					// 	powerup.moveDown();
					// 	this.server.emit('powerUpMove', {id: powerup.id, y: powerup.y});
					// }
					this.server.to(room.socketIds[0]).emit('ballPosition', newBallPos);
					this.server.to(room.socketIds[1]).emit('ballPosition', newBallPos);
					//this.server.emit('ballPosition', newBallPos);
				}
			}, 15);
		}

		// afterInit(server: Server) {
		// 	this.server = server;
		// 	console.log('Server is ready');
		// }
		
		// handleConnection(client: any, ...args: any[]) {
		// 	if (!this.players.has(client.id))
		// 	{
		// 		if (this.players.size < 1)
		// 		{
		// 			this.players.set(client.id, "left");
		// 			client.emit('direction', 'left');
		// 		}
		// 		else
		// 		{
		// 			this.players.set(client.id, "right");
		// 			client.emit('direction', 'right');
		// 			client.broadcast.emit('startGame');
		// 			client.emit('startGame');
		// 		}
		// 	}
		// 	console.log(`Client connected: ${client.id}`);
		// }

		async handleConnection(socket: Socket, ...args: any[]) {
			console.log('game socket');
			console.log(socket.handshake.query);
			if (!socket.handshake.query.userId || !socket.handshake.query.matchId) {
				//error handling?
				console.log("query doesn't have the properties userId and matchId");
				return ;
			}

			//get the user and match id from the query
			const queryUserId: number = parseInt(socket.handshake.query.userId as string, 10);
    		const queryMatchId: number = parseInt(socket.handshake.query.matchId as string, 10);

			//saving the user and match objects in the socket
			socket.data.user = await this.userService.findById(queryUserId);
			socket.data.match = await this.matchService.findById(queryMatchId);

			//first user that connects to the gateway creates the entry in the rooms array
			if (!this.rooms.has(queryMatchId)) {
				this.rooms.set(queryMatchId, new Room(queryMatchId));
			}

			const room = this.rooms.get(queryMatchId);
			if (queryUserId === socket.data.match.leftUserId) {
				socket.data.isLeftPlayer = true;
				room.socketIds[0] = socket.id;
			}
			else {
				socket.data.isLeftPlayer = false;
				room.socketIds[1] = socket.id;
			}

			// console.log(socket.data.user);
			// console.log(socket.data.match);
			//both players are connected to the games if both socket ids are set, better solution?
			console.log(socket.data.user.username + ' ' + socket.data.isLeftPlayer)
			if (room.socketIds[0] != '' && room.socketIds[1] != '') {
				console.log('starting game');
				this.startCountdown(room);
			}
		}

		async handleDisconnect(socket: Socket) {
			//this.players.delete(client.id);
			const room = this.rooms.get(socket.data.match.id);
			if (room.gameIsRunning) {
				room.gameIsRunning = false;
				//later give the room (or a custom object) with it
				const match = await this.matchService.finishMatch(socket.data.match.id);
				if (socket.data.isLeftPlayer) {
					room.leftPlayerDisconnect = true;
					socket.to(room.socketIds[1]).emit('opponentDisconnect', match);
				}
				else {
					room.rightPlayerDisconnect = true;
					socket.to(room.socketIds[0]).emit('opponentDisconnect', match);
				}
			}
			console.log(`Client disconnected: userId: ${socket.data.user.id}: ${socket.id}`);
			socket.disconnect();
		}

		// resetGame() {
		// 	this.gameIsRunning = false;
		// 	console.log("HERE");
		// 	this.rooms.get("test").ball.resetBall();
		// 	this.server.emit('ballPosition', this.rooms.get("test").ball.getBallPosition());
		// }

		@SubscribeMessage('paddle')
		handlePaddleMove(socket: Socket, direction: string): void {
			if (socket.data.isLeftPlayer === true) {
				let paddleAPos = {x: 0, y: 0, wid: 0, hgt: 0};

				if (direction === "up") {
					paddleAPos = this.rooms.get(socket.data.match.id).paddleA.movePaddleUp();
				}
				else {
					paddleAPos = this.rooms.get(socket.data.match.id).paddleA.movePaddleDown();
				}

				socket.emit('paddleMove', { playerId: 'left', newPos: paddleAPos.y });
				this.sendToOpponent(socket, this.rooms.get(socket.data.match.id).socketIds, 'paddleMove', { playerId: 'left', newPos: paddleAPos.y });
				//this.server.emit('paddleMove', { playerId: 'left', newPos: paddleAPos.y }); ->	this would send to all clients currently on the server,
				//																					we only want to send to the two users that are playing the match
			}
			else {
				let paddleBPos = {x: 0, y: 0, wid: 0, hgt: 0};

				if (direction === "up") {
					paddleBPos = this.rooms.get(socket.data.match.id).paddleB.movePaddleUp();
				}
				else {
					paddleBPos = this.rooms.get(socket.data.match.id).paddleB.movePaddleDown();
				}

				socket.emit('paddleMove', { playerId: 'right', newPos: paddleBPos.y });
				this.sendToOpponent(socket, this.rooms.get(socket.data.match.id).socketIds, 'paddleMove', { playerId: 'right', newPos: paddleBPos.y });
				//this.server.emit('paddleMove', { playerId: 'right', newPos: paddleBPos.y });
			}
			return;
		}

		@SubscribeMessage('ballX')
		updateBallX(socket: Socket, ballX: number): void {
			ballPos.x = ballX;
			this.sendToOpponent(socket, this.rooms.get(socket.data.match.id).socketIds, 'ballX', ballPos.x);
			//client.broadcast.emit('ballX', ballPos.x);
		}

		@SubscribeMessage('ballY')
		updateBallY(socket: Socket, ballY: number): void {
			ballPos.y = ballY;
			this.sendToOpponent(socket, this.rooms.get(socket.data.match.id).socketIds, 'ballY', ballPos.y);
			//client.broadcast.emit('ballY', ballPos.y);
		}

		// @SubscribeMessage('start')
		// sendStartMessage(client: any): void {
		// 	client.broadcast.emit('startGame');
		// 	console.log("start");
		// }

		@SubscribeMessage('spawnPowerUp')
		createPowerUp(socket: Socket, data: { 
			id: number,
			x: number,
			y: number,
			speed: number,
			type: number,
			wid: number,
			hgt: number,
			color: string;
		}): void {
			const room = this.rooms.get(socket.data.match.id);
			data.speed = 3;
			// data.color = "blue";
			const newPowerUp = new PowerUp(data.id, data.x, data.y, data.speed, data.type, data.wid, data.hgt, data.color);
			room.powerups.push(newPowerUp);
			socket.emit('newPowerUp', data);
			this.sendToOpponent(socket, room.socketIds, 'newPowerUp', data);
			//this.server.emit('newPowerUp', data);
			// console.log("powerup spawned at x: ", data.x)
		}

		@SubscribeMessage('activatePowerUp')
		activatePowerUp(socket: Socket, data: {
			type: string,
			player: string
		}): void {
			if (data.type == "increasePaddle")
			{
				const room = this.rooms.get(socket.data.match.id);
				room.paddleA.setHeight(400);
				socket.emit('newPaddleHeight', { player: "left", hgt: 400 });
				this.sendToOpponent(socket, room.socketIds, 'newPaddleHeight', { player: "left", hgt: 400 });
				//this.server.emit('newPaddleHeight', { player: "left", hgt: 400 });
				console.log("increase Pad");
			}
			// console.log(data.type, data.player);
		}
		@SubscribeMessage('removePowerUp')
		removePowerUp(socket: Socket, id: number) {
			const room = this.rooms.get(socket.data.match.id);
			let index = room.powerups.findIndex(powerup => powerup.id == id);
			console.log("index: ", index)
			if (index != -1) {
				room.powerups.splice(index, 1);
			}
		}

		//Helperfunctions
		private sendToOpponent(socket: Socket, socketIds: string[], eventName: string, data: any) {
			if (!socketIds[0] || socketIds[0] === '' || !socketIds[1] || socketIds[1] === '') {
				//handle error
				return ;
			}

			if (socket.data.isLeftPlayer) {
				socket.to(socketIds[1]).emit(eventName, data);
			}
			else {
				socket.to(socketIds[0]).emit(eventName, data);
			}
		}

		private startCountdown(room: Room) {
			let countdown: number = 3;
			const countdownInterval = setInterval(() => {
				if (countdown > 0) {
					this.server.to(room.socketIds[0]).emit('countdown', countdown);
					this.server.to(room.socketIds[1]).emit('countdown', countdown);
					countdown--;
				}
				else {
					clearInterval(countdownInterval);
					room.gameIsRunning = true;
					this.server.to(room.socketIds[0]).emit('startGame');
					this.server.to(room.socketIds[1]).emit('startGame');
					this.startGame(room);
				}
			}, 1000);
		}
	}
