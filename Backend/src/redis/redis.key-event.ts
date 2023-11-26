import Redis from "ioredis";
import redis, { playerKey, playersKey } from "./redis";

let url = process.env.REDIS_CONNECT || "";

let subscriber: Redis = new Redis(url);

const EVENTS = {
    EXPIRED: "__keyevent@0__:expired"
}

subscriber.subscribe(EVENTS.EXPIRED, (err, cn) => {
    if (err) {
        console.log("faild to subscribe for key expired event", err);
    }
})

subscriber.on('message', async (channel, key) => {
    if (channel === EVENTS.EXPIRED) {
        let roomName = key.split(":")[2];

        // remove the players associated with the room;
        let playerskey = playersKey(roomName);
        let players = await redis.lrange(playerskey, 0, -1);

        players.forEach(async (player) => {
            let playerkey = playerKey(roomName, player);
            await redis.del(playerkey);
        })

        await redis.del(playerskey);
    }
})

subscriber.on('error', (err) => {
    console.log("subscriber error : ", err);
})
