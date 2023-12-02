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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.joinRoom = exports.createRoom = void 0;
const redis_1 = __importDefault(require("../redis/redis"));
const room_1 = require("../models/room");
const constant_1 = require("../constant");
const createRoom = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { userName, roomName } = req.body;
    try {
        let key = (0, constant_1.roomKey)(roomName);
        let exist = yield redis_1.default.exists(key);
        if (exist) {
            throw new Error("Room already exists");
        }
        let room = new room_1.Room(roomName);
        yield redis_1.default.hset(key, room.stringify());
        yield redis_1.default.expire(key, constant_1.roomExpire);
        yield room_1.Room.addPlayerToRoom(userName, roomName);
        res.json({ room: room.name });
    }
    catch (e) {
        console.log(e);
        res.status(400).json({ error: e.message });
    }
});
exports.createRoom = createRoom;
const joinRoom = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { userName, roomName } = req.body;
    try {
        let key = (0, constant_1.roomKey)(roomName);
        let exist = yield redis_1.default.exists(key);
        if (!exist) {
            throw new Error("Room not found");
        }
        yield room_1.Room.addPlayerToRoom(userName, roomName);
        yield redis_1.default.expire(key, constant_1.roomExpire);
        res.json({ room: roomName });
    }
    catch (e) {
        console.log(e);
        res.status(400).json({ error: e.message });
    }
});
exports.joinRoom = joinRoom;
