import { Socket } from "socket.io";
import redis, { Key } from "../config/redis";
import { player } from "../models/room";

export async function roomAuth(socket: Socket, next: Function) {
    let userName = socket.handshake.auth.token;
    let roomName = socket.handshake.auth.room;

    if (!userName || !roomName) {
        return next(new Error("Invalid credentials"));
    }

    let key = Key("rooms", roomName);
    let room = await redis.hget(key, "players");
    if (!room) {
        return next(new Error("Room not found"));
    }

    let players: player[] = JSON.parse(room);
    let hasJoined = players.find(p => p.name === userName);
    if (!hasJoined) {
        return next(new Error("You are not a member of this room"));
    }

    socket.data.name = userName;
    socket.data.room = roomName;
    next();
}