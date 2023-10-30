import { Redis } from "ioredis";

let url = process.env.REDIS_CONNECT || "";
let redis: Redis = new Redis(url);

export const Key = (...args: any) => "tic-toa-ts:" + args.join(":");

export const roomExpire = 5 * 60;//5 minutes

redis.on("connect", () => {
    console.log("Redis conected");
})

redis.on('error', (err) => {
    console.log(err)
})

export default redis;