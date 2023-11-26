import { authrizedSocket } from "../middleware/roomAuth";
import { Player } from "../models/player";
import { getPlayers } from "../models/players";
import { board, Choice, initBoard, initTurn, Room } from "../models/room";
import redis, { playerKey, roomExpire, roomKey } from "../redis/redis";

export const setupPlayer = async (socket: authrizedSocket) => {

    let playerkey = playerKey(socket.data.room, socket.data.name);
    let key = roomKey(socket.data.room);

    await redis.hset(playerkey, "isOnline", 1);
    await redis.hincrby(playerkey, "cn", 1);

    let get = await redis.hgetall(key);
    await redis.expire(key, roomExpire);
    let room: Room = Room.parse(get);

    let playersIds = await getPlayers(socket.data.room);

    // @ts-ignore
    let players: Array<player> = await Promise.all(playersIds.map(async (playerId) => {
        let playerkey = playerKey(room.name, playerId);
        return redis.hgetall(playerkey);
    }))

    socket.join(socket.data.room);
    socket.emit('roomData', { ...room, players: players });
    socket.broadcast.to(socket.data.room).emit('joined', socket.data.name);
}

export const choiceChanged = async (socket: authrizedSocket, players: Player[]) => {
    let key = roomKey(socket.data.room);

    for (let player of players) {
        let key = playerKey(socket.data.room, player.name);
        await redis.hset(key, "choice", player.choice);
    }
    await redis.expire(key, roomExpire);
    socket.broadcast.to(socket.data.room).emit('selected', players);
}

export const playGame = async (socket: authrizedSocket, { board, turn }: { board: board, turn: Choice }) => {
    let key = roomKey(socket.data.room);
    await redis.hset(key, "board", JSON.stringify(board), "turn", turn);
    await redis.expire(key, roomExpire);
    socket.broadcast.to(socket.data.room).emit('moved', { board, turn })
}

export const startGame = async (socket: authrizedSocket) => {
    let key = roomKey(socket.data.room);
    await redis.hset(key, "status", "playing");
    await redis.expire(key, roomExpire);
    socket.broadcast.to(socket.data.room).emit('started');
}

export const restartGame = async (socket: authrizedSocket) => {
    let key = roomKey(socket.data.room);
    await redis.hset(key, "status", "initial", "board", JSON.stringify(initBoard), "turn", initTurn);
    await redis.expire(key, roomExpire);
    socket.broadcast.to(socket.data.room).emit('restarted');
}


export const disconnectPlayer = async (socket: authrizedSocket) => {
    console.log("disconnected " + socket.id);

    let playerkey = playerKey(socket.data.room, socket.data.name);

    await redis.hincrby(playerkey, "cn", -1);
    let cn = await redis.hget(playerkey, "cn");

    if (cn === "0") {
        await redis.hset(playerkey, "isOnline", 0);
        socket.broadcast.to(socket.data.room).emit('disconnected', socket.data.name);
    }
}