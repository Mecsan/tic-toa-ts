import redis, { playerKey, playersKey } from "../redis/redis";
import { Choice } from "./room"

export interface player {
    name: string,
    choice: Choice,
    isOnline: boolean,
    cn: number
}

export class Player implements player {
    name: string;
    choice: Choice;
    isOnline: boolean;
    cn: number;

    constructor(name: string, choice: Choice) {
        this.name = name;
        this.choice = choice;
        this.isOnline = false;
        this.cn = 0;
    }

    async save(room: string) {
        let key = playerKey(room, this.name);
        await redis.hset(key, this);
    }
}
