"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.joinRoom = exports.createRoom = void 0;
const room_1 = require("../models/room");
const createRoom = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { userName, roomName } = req.body;
    try {
        let room = room_1.rooms.getRoom(roomName);
        if (room) {
            throw new Error("Room already exists");
        }
        room = new room_1.Room(roomName);
        room.join(userName);
        room_1.rooms.addRoom(room);
        res.json({ room: room.name });
    }
    catch (e) {
        res.status(400).json({ error: e.message });
    }
});
exports.createRoom = createRoom;
const joinRoom = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { userName, roomName } = req.body;
    try {
        let room = room_1.rooms.getRoom(roomName);
        if (!room) {
            throw new Error("Room not found");
        }
        room.join(userName);
        res.json({ room: room.name });
    }
    catch (e) {
        res.status(400).json({ error: e.message });
    }
});
exports.joinRoom = joinRoom;
