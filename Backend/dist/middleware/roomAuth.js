"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roomAuth = void 0;
const room_1 = require("../models/room");
function roomAuth(socket, next) {
    let userName = socket.handshake.auth.token;
    let roomName = socket.handshake.auth.room;
    if (!userName || !roomName) {
        return next(new Error("Invalid credentials"));
    }
    let room = room_1.rooms.getRoom(roomName);
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
exports.roomAuth = roomAuth;
