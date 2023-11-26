import { Socket } from "socket.io";
import { getPlayers } from "../models/players";
import redis, { roomKey } from "../redis/redis";

export async function roomAuth(socket: Socket, next: Function) {
    let userName = socket.handshake.auth.token;
    let roomName = socket.handshake.auth.room;

    if (!userName || !roomName) {
        return next(new Error("Invalid credentials"));
    }

    let key = roomKey(roomName);
    let room = await redis.exists(key);
    if (!room) {
        return next(new Error("Room not found"));
    }

    let players = await getPlayers(roomName)

    let hasJoined = players.find(p => p === userName);
    if (!hasJoined) {
        return next(new Error("You are not a member of this room"));
    }

    socket.data.name = userName;
    socket.data.room = roomName;
    next();
}

export interface authrizedSocket extends Socket {
    data: {
        name: string;
        room: string;
    }
}