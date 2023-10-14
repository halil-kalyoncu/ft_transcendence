import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Room } from '../../service/room.service';
import { PowerUp } from '../../service/powerup.service';
import { MatchService } from '../../../match/service/match.service';
import { UserService } from '../../../user/service/user-service/user.service';
import { Match, User } from '@prisma/client';
import { Paddle } from '../../service/paddle.service';
import { JwtAuthService } from '../../../auth/service/jwt-auth/jtw-auth.service';

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
    private jwtAuthService: JwtAuthService,
  ) {}

  @WebSocketServer()
  server: Server;

  rooms = new Map<number, Room>();

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
          return;
        }
        this.rooms.delete(room.id);
        this.server.to(room.socketIds[0]).emit('gameFinished', finishedMatch);
        this.server.to(room.socketIds[1]).emit('gameFinished', finishedMatch);
      }
    }, 15);
  }

  async handleConnection(socket: Socket, ...args: any[]) {
    try {
      if (
        !socket.handshake.query.matchId ||
        !socket.handshake.headers.authorization
      ) {
        socket.disconnect();
        return;
      }

      const tokenArray: string[] =
        socket.handshake.headers.authorization.split(' ');
      const decodedToken = await this.jwtAuthService.verifyJwt(tokenArray[1]);
      const queryMatchId: number = parseInt(
        socket.handshake.query.matchId as string,
        10,
      );

      //saving the user and match objects in the socket
      const user: User = await this.userService.findById(decodedToken.user.id);
      const match: Match = await this.matchService.findById(queryMatchId);

      if (!user || !match) {
        socket.disconnect();
        return;
      }

      socket.data.user = user;
      socket.data.match = match;
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
      if (decodedToken.user.id === socket.data.match.leftUserId) {
        socket.data.isLeftPlayer = true;
        room.socketIds[0] = socket.id;
      } else {
        socket.data.isLeftPlayer = false;
        room.socketIds[1] = socket.id;
      }

      if (room.socketIds[0] != '' && room.socketIds[1] != '') {
        this.startCountdown(room);
      }
    } catch (error) {
      socket.disconnect();
    }
  }

  async handleDisconnect(socket: Socket) {
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

  @SubscribeMessage('fire')
  handleMagnetFire(@ConnectedSocket() socket: Socket): void {
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
    }
    return;
  }

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

  //   @SubscribeMessage('removePowerUp')
  //   removePowerUp(@ConnectedSocket() socket: Socket, @MessageBody() id: number) {
  //     const room = this.rooms.get(socket.data.match.id);
  //     let index = room.powerups.findIndex((powerup) => powerup.id == id);
  //     if (index != -1) {
  //       room.powerups.splice(index, 1);
  //     }
  //   }

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
      }, 10000);
    }
  }
}
