import redis, { Key, playerKey, playersKey, roomKey } from "../config/redis";
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

    static async getPlayers(room: string) {
        let playerskey = playersKey(room);
        let ids:Array<string> = await redis.lrange(playerskey,0,-1);
        return ids;
    }

    static async getPlayerChoice(room: string, player: string): Promise<string> {
        let playerkey = playerKey(room, player);
        let choice = await redis.hget(playerkey, "choice");
        return choice || 'O';
    }

    async save(room: string) {
        let key = playerKey(room, this.name);
        await redis.hset(key, this);
    }

}
