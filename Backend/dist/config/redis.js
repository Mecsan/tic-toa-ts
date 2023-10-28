"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ioredis_1 = require("ioredis");
let url = process.env.REDIS_CONNECT || "";
let redis = new ioredis_1.Redis(url);
redis.on("connect", () => {
    console.log("Redis conected");
});
redis.on('error', (err) => {
    console.log(err);
});
exports.default = redis;
