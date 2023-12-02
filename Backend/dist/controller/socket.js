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
exports.disconnectPlayer = exports.restartGame = exports.startGame = exports.playGame = exports.choiceChanged = exports.setupPlayer = void 0;
const constant_1 = require("../constant");
const players_1 = require("../models/players");
const room_1 = require("../models/room");
const pubsub_1 = __importDefault(require("../redis/pubsub"));
const redis_1 = __importDefault(require("../redis/redis"));
const setupPlayer = (socket) => __awaiter(void 0, void 0, void 0, function* () {
    let playerkey = (0, constant_1.playerKey)(socket.data.room, socket.data.name);
    let key = (0, constant_1.roomKey)(socket.data.room);
    yield redis_1.default.hset(playerkey, "isOnline", 1);
    yield redis_1.default.hincrby(playerkey, "cn", 1);
    let get = yield redis_1.default.hgetall(key);
    yield redis_1.default.expire(key, constant_1.roomExpire);
    let room = room_1.Room.parse(get);
    let playersIds = yield (0, players_1.getPlayers)(socket.data.room);
    // @ts-ignore
    let players = yield Promise.all(playersIds.map((playerId) => __awaiter(void 0, void 0, void 0, function* () {
        let playerkey = (0, constant_1.playerKey)(room.name, playerId);
        return redis_1.default.hgetall(playerkey);
    })));
    socket.join(socket.data.room);
    //TODO convert this ws request into a simple REST request
    socket.emit('roomData', Object.assign(Object.assign({}, room), { players: players }));
    let data = {
        room: socket.data.room,
        event: 'joined',
        payload: socket.data.name,
        socketId: socket.id
    };
    pubsub_1.default.publish(constant_1.CHANNELS.ROOM, JSON.stringify(data));
});
exports.setupPlayer = setupPlayer;
const choiceChanged = (socket, players) => __awaiter(void 0, void 0, void 0, function* () {
    let key = (0, constant_1.roomKey)(socket.data.room);
    for (let player of players) {
        let key = (0, constant_1.playerKey)(socket.data.room, player.name);
        yield redis_1.default.hset(key, "choice", player.choice);
    }
    yield redis_1.default.expire(key, constant_1.roomExpire);
    let data = {
        room: socket.data.room,
        event: 'selected',
        payload: players,
        socketId: socket.id
    };
    pubsub_1.default.publish(constant_1.CHANNELS.ROOM, JSON.stringify(data));
});
exports.choiceChanged = choiceChanged;
const playGame = (socket, { board, turn }) => __awaiter(void 0, void 0, void 0, function* () {
    let key = (0, constant_1.roomKey)(socket.data.room);
    yield redis_1.default.hset(key, "board", JSON.stringify(board), "turn", turn);
    yield redis_1.default.expire(key, constant_1.roomExpire);
    let data = {
        room: socket.data.room,
        event: 'moved',
        payload: { board, turn },
        socketId: socket.id
    };
    pubsub_1.default.publish(constant_1.CHANNELS.ROOM, JSON.stringify(data));
});
exports.playGame = playGame;
const startGame = (socket) => __awaiter(void 0, void 0, void 0, function* () {
    let key = (0, constant_1.roomKey)(socket.data.room);
    yield redis_1.default.hset(key, "status", "playing");
    yield redis_1.default.expire(key, constant_1.roomExpire);
    let data = {
        room: socket.data.room,
        event: 'started',
        payload: null,
        socketId: socket.id
    };
    pubsub_1.default.publish(constant_1.CHANNELS.ROOM, JSON.stringify(data));
});
exports.startGame = startGame;
const restartGame = (socket) => __awaiter(void 0, void 0, void 0, function* () {
    let key = (0, constant_1.roomKey)(socket.data.room);
    yield redis_1.default.hset(key, "status", "initial", "board", JSON.stringify(room_1.initBoard), "turn", room_1.initTurn);
    yield redis_1.default.expire(key, constant_1.roomExpire);
    let data = {
        room: socket.data.room,
        event: 'restarted',
        payload: null,
        socketId: socket.id
    };
    pubsub_1.default.publish(constant_1.CHANNELS.ROOM, JSON.stringify(data));
});
exports.restartGame = restartGame;
const disconnectPlayer = (socket) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("disconnected " + socket.id);
    let playerkey = (0, constant_1.playerKey)(socket.data.room, socket.data.name);
    yield redis_1.default.hincrby(playerkey, "cn", -1);
    let cn = yield redis_1.default.hget(playerkey, "cn");
    if (cn === "0") {
        yield redis_1.default.hset(playerkey, "isOnline", 0);
        let data = {
            room: socket.data.room,
            event: 'disconnected',
            payload: socket.data.name,
            socketId: socket.id
        };
        pubsub_1.default.publish(constant_1.CHANNELS.ROOM, JSON.stringify(data));
    }
});
exports.disconnectPlayer = disconnectPlayer;
