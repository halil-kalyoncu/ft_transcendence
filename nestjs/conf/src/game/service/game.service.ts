import { Injectable } from "@nestjs/common";
import { Room } from "./room.service";

@Injectable()
export class GameService {
	rooms: Map<string, Room> = new Map();

	createRoom(id: string): Room {
		const room = new Room(id);
		this.rooms.set(id, room);
		return room;
	}
}
