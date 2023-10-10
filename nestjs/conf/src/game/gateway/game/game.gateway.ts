import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Room } from '../../service/room.service';
import { PowerUp } from '../../service/powerup.service';
import { MatchService } from '../../../match/service/match.service';
import { UserService } from '../../../user/service/user-service/user.service';
import { Match } from '@prisma/client';
import { createECDH } from 'crypto';
import { Paddle } from 'src/game/service/paddle.service';

@WebSocketGateway({
  cors: {
    origin: [
      `http://${process.env.IP_ADDRESS}:${process.env.BACKEND}`,
      `http://${process.env.IP_ADDRESS}:${process.env.FRONTEND_PORT}`,
    ],
  },
  path: '/game',
})
export class EventsGateway {
  constructor(
    private userService: UserService,
    private matchService: MatchService,
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
    const gameInterval = setInterval(async () => {
      if (room.gameIsRunning) {
        let newBallPos;
        if (room.ball.magnet && room.ball.ballSticking) {
          if (room.ball.magnet == 1 && room.ball.ballSticking == 1) {
            if (room.diffPadBall == 0)
              room.diffPadBall = room.ball.y - room.paddleA.y;
            newBallPos = {
              x: room.paddleA.wid,
              y: room.paddleA.y + room.diffPadBall,
            };
          } else if (room.ball.magnet == 2 && room.ball.ballSticking == 2) {
            if (room.diffPadBall == 0)
              room.diffPadBall = room.ball.y + room.ball.wid - room.paddleB.y;
            newBallPos = {
              x: room.paddleB.x - room.ball.wid,
              y: room.paddleB.y + room.diffPadBall,
            };
          }
          this.server.to(room.socketIds[0]).emit('ballPosition', newBallPos);
          this.server.to(room.socketIds[1]).emit('ballPosition', newBallPos);
          room.ball.x = newBallPos.x;
          room.ball.y = newBallPos.y;
        } else if (room.ball.pause == false) {
          newBallPos = room.ball.moveBall(room, this.server);
          this.server.to(room.socketIds[0]).emit('ballPosition', newBallPos);
          this.server.to(room.socketIds[1]).emit('ballPosition', newBallPos);
        }
        for (let powerup of room.powerups) {
          powerup.moveDown();
          this.server
            .to(room.socketIds[0])
            .emit('powerUpMove', { id: powerup.id, y: powerup.y });
          this.server
            .to(room.socketIds[1])
            .emit('powerUpMove', { id: powerup.id, y: powerup.y });
        }
      } else {
        clearInterval(gameInterval);
        clearInterval(room.powerupInterval);
        const finishedMatch: Match = await this.matchService.finishMatch(room);
		if (!finishedMatch) {
			return 
		}
        this.rooms.delete(room.id);
        this.server.to(room.socketIds[0]).emit('gameFinished', finishedMatch);
        this.server.to(room.socketIds[1]).emit('gameFinished', finishedMatch);
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
    if (!socket.handshake.query.userId || !socket.handshake.query.matchId) {
      //error handling?
      console.log("query doesn't have the properties userId and matchId");
      return;
    }

    //get the user and match id from the query
    const queryUserId: number = parseInt(
      socket.handshake.query.userId as string,
      10,
    );
    const queryMatchId: number = parseInt(
      socket.handshake.query.matchId as string,
      10,
    );

    //saving the user and match objects in the socket
    socket.data.user = await this.userService.findById(queryUserId);
    socket.data.match = await this.matchService.findById(queryMatchId);

    //first user that connects to the gateway creates the entry in the rooms array
    if (!this.rooms.has(queryMatchId)) {
      let newRoom = new Room(
        queryMatchId,
        socket.data.match.goalsToWin,
        socket.data.match.leftUserId,
        socket.data.match.rightUserId,
      );

      this.rooms.set(queryMatchId, newRoom);

      await this.setPowerupInterval(newRoom);
    }

    const room = this.rooms.get(queryMatchId);
    if (queryUserId === socket.data.match.leftUserId) {
      socket.data.isLeftPlayer = true;
      room.socketIds[0] = socket.id;
    } else {
      socket.data.isLeftPlayer = false;
      room.socketIds[1] = socket.id;
    }

    //both players are connected to the games if both socket ids are set, better solution?
    if (room.socketIds[0] != '' && room.socketIds[1] != '') {
      this.startCountdown(room);
    }
  }

  async handleDisconnect(socket: Socket) {
    //this.players.delete(client.id);
    const room = this.rooms.get(socket.data.match.id);

    if (!room) {
      socket.disconnect();
      return;
    }
    if (room.gameIsRunning) {
      room.gameIsRunning = false;
      if (socket.data.isLeftPlayer) {
        room.leftPlayerDisconnect = true;
      } else {
        room.rightPlayerDisconnect = true;
      }

      const match = await this.matchService.finishMatch(room);
      this.rooms.delete(socket.data.match.id);
      if (socket.data.isLeftPlayer) {
        socket.to(room.socketIds[1]).emit('gameFinished', match);
      } else {
        socket.to(room.socketIds[0]).emit('gameFinished', match);
      }
    }
    if (room.powerupInterval) {
      clearInterval(room.powerupInterval);
    }
    socket.disconnect();
  }
  // resetGame() {
  // 	this.gameIsRunning = false;
  // 	console.log("HERE");
  // 	this.rooms.get("test").ball.resetBall();
  // 	this.server.emit('ballPosition', this.rooms.get("test").ball.getBallPosition());
  // }

  @SubscribeMessage('fire')
  handleMagnetFire(@ConnectedSocket() socket: Socket): void {
    console.log('FIRE');
    const room = this.rooms.get(socket.data.match.id);
    if (socket.id === room.socketIds[0] && room.ball.magnet === 1) {
      room.ball.ballSticking = 0;
      room.ball.magnet = 0;
      room.diffPadBall = 0;
    }
    if (socket.id === room.socketIds[1] && room.ball.magnet === 2) {
      room.ball.ballSticking = 0;
      room.ball.magnet = 0;
      room.diffPadBall = 0;
    }
  }

  @SubscribeMessage('paddle')
  handlePaddleMove(
    @ConnectedSocket() socket: Socket,
    @MessageBody() direction: string,
  ): void {
    if (socket.data.isLeftPlayer === true) {
      let paddleAPos = { x: 0, y: 0, wid: 0, hgt: 0 };

      if (direction === 'up') {
        paddleAPos = this.rooms
          .get(socket.data.match.id)
          .paddleA.movePaddleUp();
      } else {
        paddleAPos = this.rooms
          .get(socket.data.match.id)
          .paddleA.movePaddleDown();
      }

      socket.emit('paddleMove', { playerId: 'left', newPos: paddleAPos.y });
      this.sendToOpponent(
        socket,
        this.rooms.get(socket.data.match.id).socketIds,
        'paddleMove',
        { playerId: 'left', newPos: paddleAPos.y },
      );

      //this.server.emit('paddleMove', { playerId: 'left', newPos: paddleAPos.y }); ->	this would send to all clients currently on the server,
      //																					we only want to send to the two users that are playing the match
    } else {
      let paddleBPos = { x: 0, y: 0, wid: 0, hgt: 0 };

      if (direction === 'up') {
        paddleBPos = this.rooms
          .get(socket.data.match.id)
          .paddleB.movePaddleUp();
      } else {
        paddleBPos = this.rooms
          .get(socket.data.match.id)
          .paddleB.movePaddleDown();
      }

      socket.emit('paddleMove', { playerId: 'right', newPos: paddleBPos.y });
      this.sendToOpponent(
        socket,
        this.rooms.get(socket.data.match.id).socketIds,
        'paddleMove',
        { playerId: 'right', newPos: paddleBPos.y },
      );
      //this.server.emit('paddleMove', { playerId: 'right', newPos: paddleBPos.y });
    }
    return;
  }

  // @SubscribeMessage('ballX')
  // updateBallX(socket: Socket, ballX: number): void {
  // 	ballPos.x = ballX;
  // 	this.sendToOpponent(socket, this.rooms.get(socket.data.match.id).socketIds, 'ballX', ballPos.x);
  // 	//client.broadcast.emit('ballX', ballPos.x);
  // }

  // @SubscribeMessage('ballY')
  // updateBallY(socket: Socket, ballY: number): void {
  // 	ballPos.y = ballY;
  // 	this.sendToOpponent(socket, this.rooms.get(socket.data.match.id).socketIds, 'ballY', ballPos.y);
  // 	//client.broadcast.emit('ballY', ballPos.y);
  // }

  // @SubscribeMessage('start')
  // sendStartMessage(client: any): void {
  // 	client.broadcast.emit('startGame');
  // 	console.log("start");
  // }

  @SubscribeMessage('spawnPowerUp')
  createPowerUp(
    @ConnectedSocket() socket: Socket,
    @MessageBody()
    data: {
      id: number;
      x: number;
      y: number;
      speed: number;
      type: string;
      wid: number;
      hgt: number;
      color: string;
    },
  ): void {
    const room = this.rooms.get(socket.data.match.id);
    data.speed = 0.2;
    // data.color = "blue";
    const newPowerUp = new PowerUp(
      data.id,
      data.x,
      data.y,
      data.speed,
      data.type,
      data.wid,
      data.hgt,
      data.color,
    );
    room.powerups.push(newPowerUp);
    // socket.emit('newPowerUp', data);
    // this.sendToOpponent(socket, room.socketIds, 'newPowerUp', data);
    // this.server.to(room.socketIds[1]).emit('newPowerUp', data);
    // console.log("powerup spawned at x: ", data.x)
  }

  @SubscribeMessage('executePowerUp')
  activatePowerUp(
    @ConnectedSocket() socket: Socket,
    @MessageBody()
    data: {
      type: string;
      player: string;
    },
  ): void {
    let target: Paddle;
    const room = this.rooms.get(socket.data.match.id);

    if (data.player == 'left') {
      target = room.paddleA;
    } else {
      target = room.paddleB;
    }
    if (data.type == 'increasePaddleHeight') {
      target.increaseHeight();
    }
    if (data.type == 'decreasePaddleHeight') {
      target.decreaseHeight();
    }
    if (data.type == 'magnet') {
      if (data.player == 'left') room.ball.magnet = 1;
      else room.ball.magnet = 2;
    }
    if (data.type == 'slowBall') {
      room.ball.changeSpeed(-2);
    }
    if (data.type == 'fastBall') {
      room.ball.changeSpeed(2);
    }
  }

  @SubscribeMessage('removePowerUp')
  removePowerUp(@ConnectedSocket() socket: Socket, @MessageBody() id: number) {
    const room = this.rooms.get(socket.data.match.id);
    let index = room.powerups.findIndex((powerup) => powerup.id == id);
    if (index != -1) {
      room.powerups.splice(index, 1);
    }
  }

  @SubscribeMessage('maxWaitingTimeReached')
  async maxWaitingTimeReached(@ConnectedSocket() socket: Socket) {
    const room = this.rooms.get(socket.data.match.id);

    room.gameIsRunning = false;
    if (socket.data.isLeftPlayer) {
      room.leftPlayerDisconnect = true;
    } else {
      room.rightPlayerDisconnect = true;
    }

    const match = await this.matchService.finishMatch(room);
    this.rooms.delete(socket.data.match.id);
    clearInterval(room.powerupInterval);
    socket.emit('gameFinished', match);
  }

  //Helperfunctions
  private sendToOpponent(
    socket: Socket,
    socketIds: string[],
    eventName: string,
    data: any,
  ) {
    if (
      !socketIds[0] ||
      socketIds[0] === '' ||
      !socketIds[1] ||
      socketIds[1] === ''
    ) {
      //handle error
      return;
    }

    if (socket.data.isLeftPlayer) {
      socket.to(socketIds[1]).emit(eventName, data);
    } else {
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
      } else {
        clearInterval(countdownInterval);
        if (room.leftPlayerDisconnect || room.rightPlayerDisconnect) {
          return;
        }
        room.gameIsRunning = true;
        this.server.to(room.socketIds[0]).emit('startGame');
        this.server.to(room.socketIds[1]).emit('startGame');
        this.startGame(room);
      }
    }, 1000);
  }

  private async setPowerupInterval(room: Room) {
    const powerupNames: string[] = await this.matchService.getPowerupNames(
      room.id,
    );
    if (powerupNames.length > 0) {
      room.powerupInterval = setInterval(async () => {
        let powerUpIndex = Math.floor(Math.random() * powerupNames.length);
        let x =
          Math.floor(Math.random() * (room.ball.fieldWidth - 70 - 70 + 1)) + 70;
        let y = -70;
        const newPowerUpData = {
          powerUp: powerupNames[powerUpIndex],
          x: x,
          y: y,
        };
        this.server.to(room.socketIds[0]).emit('newPowerUp', newPowerUpData);
        this.server.to(room.socketIds[1]).emit('newPowerUp', newPowerUpData);
      }, 10000);
    }
  }
}
