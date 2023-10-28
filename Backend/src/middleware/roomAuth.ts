import { Socket } from "socket.io";
import { rooms } from "../models/room";

export function roomAuth(socket: Socket, next: Function) {
    let userName = socket.handshake.auth.token;
    let roomName = socket.handshake.auth.room;
    if (!userName || !roomName) {
        return next(new Error("Invalid credentials"));
    }

    let room = rooms.getRoom(roomName);
    if (!room) {
        return next(new Error("Room not found"));
    }

    let hasJoined = room.players.find(p => p.name === userName);
    if (!hasJoined) {
        return next(new Error("You are not a member of this room"));
    }

    socket.data.name = userName;
    socket.data.room = roomName;
    next();
}