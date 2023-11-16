"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ioredis_1 = __importDefault(require("ioredis"));
const redis_1 = __importStar(require("./redis"));
let url = process.env.REDIS_CONNECT || "";
let subscriber = new ioredis_1.default(url);
const EVENTS = {
    EXPIRED: "__keyevent@0__:expired"
};
subscriber.subscribe(EVENTS.EXPIRED, (err, cn) => {
    if (err) {
        console.log("faild to subscribe for key expired event", err);
    }
});
subscriber.on('message', (channel, key) => __awaiter(void 0, void 0, void 0, function* () {
    if (channel === EVENTS.EXPIRED) {
        let roomName = key.split(":")[2];
        // remove the players associated with the room;
        let playerskey = (0, redis_1.playersKey)(roomName);
        let players = yield redis_1.default.lrange(playerskey, 0, -1);
        players.forEach((player) => __awaiter(void 0, void 0, void 0, function* () {
            let playerkey = (0, redis_1.playerKey)(roomName, player);
            yield redis_1.default.del(playerkey);
        }));
        yield redis_1.default.del(playerskey);
    }
}));
subscriber.on('error', (err) => {
    console.log("subscriber error : ", err);
});
