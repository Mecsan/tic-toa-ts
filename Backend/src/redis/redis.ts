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

export default redis;