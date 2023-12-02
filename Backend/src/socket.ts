import { Server } from 'http';
import { Server as SocketServer } from 'socket.io';
import { authrizedSocket, roomAuth } from './middleware/roomAuth';
import { choiceChanged, disconnectPlayer, playGame, restartGame, setupPlayer, startGame } from './controller/socket';


export function socketSetup(server: Server): SocketServer {
    
    const io = new SocketServer(server, {
        transports: ['websocket']
    });

    io.use(roomAuth);

    io.on('connection', async (socket: authrizedSocket) => {
        console.log("connected " + socket.id);

        await setupPlayer(socket);

        socket.on('select', (players) => choiceChanged(socket, players));

        socket.on('move', (data) => playGame(socket, data));

        socket.on('start', () => startGame(socket))

        socket.on('restart', () => restartGame(socket));

        socket.on('disconnect', () => disconnectPlayer(socket))
    })

    return io;
}