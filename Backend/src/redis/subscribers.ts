import { CHANNELS, playerKey, playersKey } from "../constant";
import { RoomMessage } from "../controller/socket";
import io from "../server";
import pubSub from "./pubsub";
import redis from "./redis";

pubSub.subscribe(CHANNELS.EXPIRED);
pubSub.subscribe(CHANNELS.ROOM);

pubSub.onMessage(async (channel: string, message: string) => {
    switch (channel) {
        case CHANNELS.EXPIRED:
            handleRoomExpired(message);
            break;

        case CHANNELS.ROOM:
            handleRoom(message);
            break;

        default:
            break;
    }
})

async function handleRoomExpired(data: string) {
    try {
        let roomName = data.split(":")[2];

        // remove the players associated with the room;
        let playerskey = playersKey(roomName);
        let players = await redis.lrange(playerskey, 0, -1);

        players.forEach(async (player) => {
            let playerkey = playerKey(roomName, player);
            await redis.del(playerkey);
        })

        await redis.del(playerskey);
    } catch (error) {
        console.log(error)
    }
}

async function handleRoom(data: string) {
    try {
        let message: RoomMessage = JSON.parse(data);
        let roomSockets = await io.in(message.room).fetchSockets();

        console.log("emitting from" + process.pid)

        // send data to all sockets in the room except the sender
        for (let socket of roomSockets) {
            if (socket.id == message.socketId) continue;
            socket.emit(message.event, message.payload);
        }

    } catch (error) {
        console.log(error)
    }
}