import { Redis } from "ioredis";

let url = process.env.REDIS_CONNECT || "";
let redis: Redis = new Redis(url);

redis.on("connect", () => {
    console.log("Redis conected");
})

redis.on('error', (err) => {
    console.log(err)
})

export default redis;