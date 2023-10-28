import { Server } from 'http';
import { Server as SocketServer, Socket } from 'socket.io';
import { roomAuth } from './middleware/roomAuth';
import { board, Choice, initBoard, initTurn, player, rooms } from './models/room';


export function socketSetup(server: Server) {
    const io = new SocketServer(server,
        {
            cors: {
                origin: "*"
            },
        });

    io.use(roomAuth);
    io.on('connection', (socket) => {

        console.log("connected " + socket.id);

        let room = rooms.getRoom(socket.data.room);
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
        })

        socket.on('move', ({ board, turn }: { board: board, turn: Choice }) => {
            if (room) {
                room.board = board;
                room.turn = turn;
            }
            socket.broadcast.to(socket.data.room).emit('moved', { board, turn })
        })

        socket.on('start', () => {
            if (room) {
                room.status = "playing";
            }
            socket.broadcast.to(socket.data.room).emit('started');
        })

        socket.on('restart', () => {
            if (room) {
                room.status = "initial";
                room.board = initBoard;
                room.turn = initTurn;
            }
            socket.broadcast.to(socket.data.room).emit('restarted');
        })

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
        })
    })
}