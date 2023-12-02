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
const constant_1 = require("../constant");
const server_1 = __importDefault(require("../server"));
const pubsub_1 = __importDefault(require("./pubsub"));
const redis_1 = __importDefault(require("./redis"));
pubsub_1.default.subscribe(constant_1.CHANNELS.EXPIRED);
pubsub_1.default.subscribe(constant_1.CHANNELS.ROOM);
pubsub_1.default.onMessage((channel, message) => __awaiter(void 0, void 0, void 0, function* () {
    switch (channel) {
        case constant_1.CHANNELS.EXPIRED:
            handleRoomExpired(message);
            break;
        case constant_1.CHANNELS.ROOM:
            handleRoom(message);
            break;
        default:
            break;
    }
}));
function handleRoomExpired(data) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let roomName = data.split(":")[2];
            // remove the players associated with the room;
            let playerskey = (0, constant_1.playersKey)(roomName);
            let players = yield redis_1.default.lrange(playerskey, 0, -1);
            players.forEach((player) => __awaiter(this, void 0, void 0, function* () {
                let playerkey = (0, constant_1.playerKey)(roomName, player);
                yield redis_1.default.del(playerkey);
            }));
            yield redis_1.default.del(playerskey);
        }
        catch (error) {
            console.log(error);
        }
    });
}
function handleRoom(data) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let message = JSON.parse(data);
            let roomSockets = yield server_1.default.in(message.room).fetchSockets();
            console.log("emitting from" + process.pid);
            // send data to all sockets in the room except the sender
            for (let socket of roomSockets) {
                if (socket.id == message.socketId)
                    continue;
                socket.emit(message.event, message.payload);
            }
        }
        catch (error) {
            console.log(error);
        }
    });
}
