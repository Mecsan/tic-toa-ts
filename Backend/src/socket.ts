import { Server } from 'http';
import { Server as SocketServer } from 'socket.io';
import redis, { playerKey, playersKey, roomExpire, roomKey } from './config/redis';
import { roomAuth } from './middleware/roomAuth';
import { player } from './models/player';
import { board, Choice, initBoard, initTurn, Room } from './models/room';


export function socketSetup(server: Server) {
    const io = new SocketServer(server, {
        transports: ['websocket']
    });

    io.use(roomAuth);

    io.on('connection', async (socket) => {
        console.log("connected " + socket.id);

        let playerkey = playerKey(socket.data.room, socket.data.name);

        await redis.hset(playerkey, "isOnline", 1);
        await redis.hincrby(playerkey, "cn", 1);

        let key = roomKey(socket.data.room);
        
        let get = await redis.hgetall(key);
        await redis.expire(key, roomExpire);
        let room: Room = Room.parse(get);

        let playerskey = playersKey(socket.data.room);
        let playersIds = await redis.lrange(playerskey, 0, -1);

        //@ts-ignore
        let players: Array<player> = await Promise.all(playersIds.map(async (playerId) => {
            let playerkey = playerKey(room.name, playerId);
            return redis.hgetall(playerkey);
        }))

        socket.join(socket.data.room);
        socket.emit('roomData', { ...room, players: players });

        socket.broadcast.to(socket.data.room).emit('joined', socket.data.name);

        socket.on('select', async (players) => {
            for (let player of players) {
                let key = playerKey(socket.data.room, player.name);
                await redis.hset(key, "choice", player.choice);
            }
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

            await redis.hincrby(playerkey, "cn", -1);
            let cn = await redis.hget(playerkey, "cn");

            if (cn === "0") {
                await redis.hset(playerkey, "isOnline", 0);
                socket.broadcast.to(socket.data.room).emit('disconnected', socket.data.name);
            }
        })
    })
}