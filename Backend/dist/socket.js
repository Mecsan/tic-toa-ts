"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.socketSetup = void 0;
const socket_io_1 = require("socket.io");
const roomAuth_1 = require("./middleware/roomAuth");
const room_1 = require("./models/room");
function socketSetup(server) {
    const io = new socket_io_1.Server(server, {
        cors: {
            origin: "*"
        },
    });
    io.use(roomAuth_1.roomAuth);
    io.on('connection', (socket) => {
        console.log("connected " + socket.id);
        let room = room_1.rooms.getRoom(socket.data.room);
        //@ts-ignore
        let player = room.getPlayer(socket.data.name);
        if (player) {
            player.cn++;
            player.isOnline = true;
        }
        socket.join(socket.data.room);
        socket.emit('roomData', room);
        socket.broadcast.to(socket.data.room).emit('joined', player);
        socket.on('select', ({ player1, player2 }) => {
            if (room) {
                room.players = [player1, player2];
            }
            socket.broadcast.to(socket.data.room).emit('selected', { player1, player2 });
        });
        socket.on('move', ({ board, turn }) => {
            if (room) {
                room.board = board;
                room.turn = turn;
            }
            socket.broadcast.to(socket.data.room).emit('moved', { board, turn });
        });
        socket.on('start', () => {
            if (room) {
                room.status = "playing";
            }
            socket.broadcast.to(socket.data.room).emit('started');
        });
        socket.on('restart', () => {
            if (room) {
                room.status = "initial";
                room.board = room_1.initBoard;
                room.turn = room_1.initTurn;
            }
            socket.broadcast.to(socket.data.room).emit('restarted');
        });
        socket.on('disconnect', () => {
            console.log("disconnected " + socket.id);
            if (room) {
                let player = room.getPlayer(socket.data.name);
                if (player) {
                    player.cn--;
                    if (player.cn == 0) {
                        player.isOnline = false;
                        socket.broadcast.to(socket.data.room).emit('disconnected', player);
                    }
                }
            }
        });
    });
}
exports.socketSetup = socketSetup;
