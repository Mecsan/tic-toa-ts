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
exports.socketSetup = void 0;
const socket_io_1 = require("socket.io");
const roomAuth_1 = require("./middleware/roomAuth");
const socket_1 = require("./controller/socket");
function socketSetup(server) {
    const io = new socket_io_1.Server(server, {
        transports: ['websocket']
    });
    io.use(roomAuth_1.roomAuth);
    io.on('connection', (socket) => __awaiter(this, void 0, void 0, function* () {
        console.log("connected " + socket.id);
        yield (0, socket_1.setupPlayer)(socket);
        socket.on('select', (players) => (0, socket_1.choiceChanged)(socket, players));
        socket.on('move', (data) => (0, socket_1.playGame)(socket, data));
        socket.on('start', () => (0, socket_1.startGame)(socket));
        socket.on('restart', () => (0, socket_1.restartGame)(socket));
        socket.on('disconnect', () => (0, socket_1.disconnectPlayer)(socket));
    }));
    return io;
}
exports.socketSetup = socketSetup;
