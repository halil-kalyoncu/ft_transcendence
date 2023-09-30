import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Room } from '../../service/room.service';
import { PowerUp } from '../../service/powerup.service';
import { MatchService } from '../../../match/service/match.service';
import { UserService } from '../../../user/service/user-service/user.service';
import { Match } from '@prisma/client';
import { createECDH } from 'crypto';

let diffPadBall = 0;
let intervalId;
@WebSocketGateway({
  cors: {
    origin: ['http://localhost:4200', 'http://localhost:3000'],
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
            if (diffPadBall == 0) diffPadBall = room.ball.y - room.paddleA.y;
            newBallPos = {
              x: room.paddleA.wid,
              y: room.paddleA.y + diffPadBall,
            };
          } else if (room.ball.magnet == 2 && room.ball.ballSticking == 2) {
            if (diffPadBall == 0)
              diffPadBall = room.ball.y + room.ball.wid - room.paddleB.y;
            newBallPos = {
              x: room.paddleB.x - room.ball.wid,
              y: room.paddleB.y + diffPadBall,
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
          this.server.emit('powerUpMove', { id: powerup.id, y: powerup.y });
        }
      } else {
        const finishedMatch: Match = await this.matchService.finishMatch(room);
        this.server.to(room.socketIds[0]).emit('gameFinished', finishedMatch);
        this.server.to(room.socketIds[1]).emit('gameFinished', finishedMatch);
        clearInterval(gameInterval);
        clearInterval(intervalId);
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
      this.rooms.set(
        queryMatchId,
        new Room(
          queryMatchId,
          socket.data.match.goalsToWin,
          socket.data.match.leftUserId,
          socket.data.match.rightUserId,
        ),
      );
      const powerupNames: string[] = await this.matchService.getPowerupNames(
        queryMatchId,
      );
      if (powerupNames.length > 0) {
        intervalId = setInterval(async () => {
          let powerUpIndex = Math.floor(Math.random() * powerupNames.length);
          console.log(powerUpIndex);
          let x =
            Math.floor(Math.random() * (room.ball.fieldWidth - 70 - 70 + 1)) +
            70;
          let y = -70;
          this.server.emit('newPowerUp', {
            powerUp: powerupNames[powerUpIndex],
            x: x,
            y: y,
          });
        }, 10000);
      }
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
    console.log(socket.data.user.username + ' disconnected');
    if (room.gameIsRunning) {
      room.gameIsRunning = false;
      if (socket.data.isLeftPlayer) {
        room.leftPlayerDisconnect = true;
      } else {
        room.rightPlayerDisconnect = true;
      }

      const match = await this.matchService.finishMatch(room);
	  console.log(match)

      if (socket.data.isLeftPlayer) {
        socket.to(room.socketIds[1]).emit('gameFinished', match);
      } else {
        socket.to(room.socketIds[0]).emit('gameFinished', match);
      }
    }
    clearInterval(intervalId);
    socket.disconnect();
  }

  // resetGame() {
  // 	this.gameIsRunning = false;
  // 	console.log("HERE");
  // 	this.rooms.get("test").ball.resetBall();
  // 	this.server.emit('ballPosition', this.rooms.get("test").ball.getBallPosition());
  // }

  @SubscribeMessage('fire')
  handleMagnetFire(socket: Socket): void {
    console.log('FIRE');
    const room = this.rooms.get(socket.data.match.id);
    if (socket.id === room.socketIds[0] && room.ball.magnet === 1) {
      room.ball.ballSticking = 0;
      room.ball.magnet = 0;
      diffPadBall = 0;
    }
    if (socket.id === room.socketIds[1] && room.ball.magnet === 2) {
      room.ball.ballSticking = 0;
      room.ball.magnet = 0;
      diffPadBall = 0;
    }
  }

  @SubscribeMessage('paddle')
  handlePaddleMove(socket: Socket, direction: string): void {
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
    socket: Socket,
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
    socket: Socket,
    data: {
      type: string;
      player: string;
    },
  ): void {
    let target;
    const room = this.rooms.get(socket.data.match.id);

    if (data.player == 'left') {
      target = room.paddleA;
    } else {
      target = room.paddleB;
    }
    if (data.type == 'increasePaddleHeight') {
      target.setHeight(400);
    }
    if (data.type == 'decreasePaddleHeight') {
      target.setHeight(80);
    }
    if (data.type == 'magnet') {
      if (data.player == 'left') room.ball.magnet = 1;
      else room.ball.magnet = 2;
    }
    if (data.type == 'slowBall') {
      room.ball.updateSpeed(2);
    }
    if (data.type == 'fastBall') {
      room.ball.updateSpeed(9);
    }
  }

  @SubscribeMessage('removePowerUp')
  removePowerUp(socket: Socket, id: number) {
    const room = this.rooms.get(socket.data.match.id);
    let index = room.powerups.findIndex((powerup) => powerup.id == id);
    console.log('index: ', index);
    if (index != -1) {
      room.powerups.splice(index, 1);
    }
  }

  @SubscribeMessage('maxWaitingTimeReached')
  async maxWaitingTimeReached(socket: Socket) {
    const room = this.rooms.get(socket.data.match.id);

    room.gameIsRunning = false;
    if (socket.data.isLeftPlayer) {
      room.leftPlayerDisconnect = true;
    } else {
      room.rightPlayerDisconnect = true;
    }

    const match = await this.matchService.finishMatch(room);
    clearInterval(intervalId);
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
        room.gameIsRunning = true;
        this.server.to(room.socketIds[0]).emit('startGame');
        this.server.to(room.socketIds[1]).emit('startGame');
        this.startGame(room);
      }
    }, 1000);
  }
}
