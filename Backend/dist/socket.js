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
exports.socketSetup = void 0;
const socket_io_1 = require("socket.io");
const redis_1 = __importStar(require("./config/redis"));
const roomAuth_1 = require("./middleware/roomAuth");
const room_1 = require("./models/room");
function socketSetup(server) {
    const io = new socket_io_1.Server(server, {
        transports: ['websocket']
    });
    io.use(roomAuth_1.roomAuth);
    io.on('connection', (socket) => __awaiter(this, void 0, void 0, function* () {
        console.log("connected " + socket.id);
        let playerkey = (0, redis_1.playerKey)(socket.data.room, socket.data.name);
        yield redis_1.default.hset(playerkey, "isOnline", 1);
        yield redis_1.default.hincrby(playerkey, "cn", 1);
        let key = (0, redis_1.roomKey)(socket.data.room);
        let get = yield redis_1.default.hgetall(key);
        yield redis_1.default.expire(key, redis_1.roomExpire);
        let room = room_1.Room.parse(get);
        let playerskey = (0, redis_1.playersKey)(socket.data.room);
        let playersIds = yield redis_1.default.lrange(playerskey, 0, -1);
        //@ts-ignore
        let players = yield Promise.all(playersIds.map((playerId) => __awaiter(this, void 0, void 0, function* () {
            let playerkey = (0, redis_1.playerKey)(room.name, playerId);
            return redis_1.default.hgetall(playerkey);
        })));
        socket.join(socket.data.room);
        socket.emit('roomData', Object.assign(Object.assign({}, room), { players: players }));
        socket.broadcast.to(socket.data.room).emit('joined', socket.data.name);
        socket.on('select', (players) => __awaiter(this, void 0, void 0, function* () {
            for (let player of players) {
                let key = (0, redis_1.playerKey)(socket.data.room, player.name);
                yield redis_1.default.hset(key, "choice", player.choice);
            }
            yield redis_1.default.expire(key, redis_1.roomExpire);
            socket.broadcast.to(socket.data.room).emit('selected', players);
        }));
        socket.on('move', ({ board, turn }) => __awaiter(this, void 0, void 0, function* () {
            yield redis_1.default.hset(key, "board", JSON.stringify(board), "turn", turn);
            yield redis_1.default.expire(key, redis_1.roomExpire);
            socket.broadcast.to(socket.data.room).emit('moved', { board, turn });
        }));
        socket.on('start', () => __awaiter(this, void 0, void 0, function* () {
            yield redis_1.default.hset(key, "status", "playing");
            yield redis_1.default.expire(key, redis_1.roomExpire);
            socket.broadcast.to(socket.data.room).emit('started');
        }));
        socket.on('restart', () => __awaiter(this, void 0, void 0, function* () {
            yield redis_1.default.hset(key, "status", "initial", "board", JSON.stringify(room_1.initBoard), "turn", room_1.initTurn);
            yield redis_1.default.expire(key, redis_1.roomExpire);
            socket.broadcast.to(socket.data.room).emit('restarted');
        }));
        socket.on('disconnect', () => __awaiter(this, void 0, void 0, function* () {
            console.log("disconnected " + socket.id);
            yield redis_1.default.hincrby(playerkey, "cn", -1);
            let cn = yield redis_1.default.hget(playerkey, "cn");
            if (cn === "0") {
                yield redis_1.default.hset(playerkey, "isOnline", 0);
                socket.broadcast.to(socket.data.room).emit('disconnected', socket.data.name);
            }
        }));
    }));
}
exports.socketSetup = socketSetup;
