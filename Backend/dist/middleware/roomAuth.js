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
exports.roomAuth = void 0;
const constant_1 = require("../constant");
const players_1 = require("../models/players");
const redis_1 = __importDefault(require("../redis/redis"));
function roomAuth(socket, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let userName = socket.handshake.auth.token;
        let roomName = socket.handshake.auth.room;
        if (!userName || !roomName) {
            return next(new Error("Invalid credentials"));
        }
        let key = (0, constant_1.roomKey)(roomName);
        let room = yield redis_1.default.exists(key);
        if (!room) {
            return next(new Error("Room not found"));
        }
        let players = yield (0, players_1.getPlayers)(roomName);
        let hasJoined = players.find(p => p === userName);
        if (!hasJoined) {
            return next(new Error("You are not a member of this room"));
        }
        socket.data.name = userName;
        socket.data.room = roomName;
        next();
    });
}
exports.roomAuth = roomAuth;
