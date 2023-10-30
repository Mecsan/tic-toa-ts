"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roomExpire = exports.Key = void 0;
const ioredis_1 = require("ioredis");
let url = process.env.REDIS_CONNECT || "";
let redis = new ioredis_1.Redis(url);
const Key = (...args) => "tic-toa-ts:" + args.join(":");
exports.Key = Key;
exports.roomExpire = 5 * 60; //5 minutes
redis.on("connect", () => {
    console.log("Redis conected");
});
redis.on('error', (err) => {
    console.log(err);
});
exports.default = redis;
