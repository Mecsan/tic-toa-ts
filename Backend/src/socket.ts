import { Server } from 'http';
import { Server as SocketServer, Socket } from 'socket.io';
import redis, { Key, roomExpire } from './config/redis';
import { roomAuth } from './middleware/roomAuth';
import { board, Choice, initBoard, initTurn, player, Room } from './models/room';


export function socketSetup(server: Server) {
    const io = new SocketServer(server, {
        transports: ['websocket']
    });

    io.use(roomAuth);

    io.on('connection', async (socket) => {
        console.log("connected " + socket.id);

        let key = Key("rooms", socket.data.room);

        let get = await redis.hgetall(key);
        let room: Room = Room.parse(get);

        let player = room.getPlayer(socket.data.name);
        if (player) {
            player.cn++;
            player.isOnline = true;
        }
        await redis.hset(key, "players", JSON.stringify(room.players));
        await redis.expire(key, roomExpire);

        socket.join(socket.data.room);
        socket.emit('roomData', room);
        socket.broadcast.to(socket.data.room).emit('joined', player);

        socket.on('select', async (players) => {
            await redis.hset(key, "players", JSON.stringify(players));
            await redis.expire(key, roomExpire);
            socket.broadcast.to(socket.data.room).emit('selected', players);
        })

        socket.on('move', async ({ board, turn }: { board: board, turn: Choice }) => {
            await redis.hset(key, "board", JSON.stringify(board), "turn", turn);
            await redis.expire(key, roomExpire);
            socket.broadcast.to(socket.data.room).emit('moved', { board, turn })
        })

        socket.on('start', async () => {
            await redis.hset(key, "status", "playing");
            await redis.expire(key, roomExpire);
            socket.broadcast.to(socket.data.room).emit('started');
        })

        socket.on('restart', async () => {
            await redis.hset(key, "status", "initial", "board", JSON.stringify(initBoard), "turn", initTurn);
            await redis.expire(key, roomExpire);
            socket.broadcast.to(socket.data.room).emit('restarted');
        })

        socket.on('disconnect', async () => {
            console.log("disconnected " + socket.id);

            let get = await redis.hget(key, "players");
            if (get) {
                let players: player[] = JSON.parse(get);
                let dummy = {
                    players: players
                }
                let player = room.getPlayer.call(dummy, socket.data.name);
                if (player) {
                    player.cn--;
                    if (player.cn == 0) {
                        player.isOnline = false;
                        socket.broadcast.to(socket.data.room).emit('disconnected', player);
                    }
                    await redis.hset(key, "players", JSON.stringify(dummy.players));
                }
            }
        })
    })
}