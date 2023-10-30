"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const redis_1 = __importStar(require("../config/redis"));
const room_1 = require("../models/room");
const createRoom = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { userName, roomName } = req.body;
    try {
        let exist = yield redis_1.default.exists((0, redis_1.Key)("rooms", roomName));
        if (exist) {
            throw new Error("Room already exists");
        }
        let room = new room_1.Room(roomName);
        room.join(userName);
        let key = (0, redis_1.Key)("rooms", room.name);
        yield redis_1.default.hset(key, room.stringify());
        yield redis_1.default.expire(key, redis_1.roomExpire);
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
        let key = (0, redis_1.Key)("rooms", roomName);
        let exist = yield redis_1.default.hgetall(key);
        if (Object.keys(exist).length == 0) {
            throw new Error("Room not found");
        }
        let room = room_1.Room.parse(exist);
        room.join(userName);
        yield redis_1.default.hset(key, "players", JSON.stringify(room.players));
        yield redis_1.default.expire(key, redis_1.roomExpire);
        res.json({ room: room.name });
    }
    catch (e) {
        res.status(400).json({ error: e.message });
    }
});
exports.joinRoom = joinRoom;
