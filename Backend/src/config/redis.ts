import { Redis } from "ioredis";

let url = process.env.REDIS_CONNECT || "";

let redis: Redis = new Redis(url);
redis.config("SET", "notify-keyspace-events", "Ex");

redis.on("connect", () => {
    console.log("Redis conected");
})

redis.on('error', (err) => {
    console.log("redis error : ", err)
})

export const Key = (...args: any) => "tic-toa-ts:" + args.join(":");

// tic-toa-ts:rooms:${room1}
export const roomKey = (room: string) => Key("rooms", room);

// tic-toa-ts:players:${room1}:${player1}
export const playerKey = (room: string, player: string) => Key("players", room, player);

// tic-toa-ts:rooms:${room1}:players
export const playersKey = (room: string) => Key("rooms", room, "players");

export const roomExpire = 30 * 60;//30 minutes

export default redis;