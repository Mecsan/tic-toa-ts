import { Socket } from "socket.io";
import redis, { Key, playerKey, playersKey, roomKey } from "../config/redis";
import { player } from "../models/player";

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

    let playerskey = playersKey(roomName);
    let players: Array<string> = await redis.lrange(playerskey, 0, -1);
    
    let hasJoined = players.find(p => p === userName);
    if (!hasJoined) {
        return next(new Error("You are not a member of this room"));
    }

    socket.data.name = userName;
    socket.data.room = roomName;
    next();
}