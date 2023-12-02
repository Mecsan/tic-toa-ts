import { playersKey } from "../constant";
import redis from "../redis/redis";

export type Players = string[]

export async function getPlayers(room: string): Promise<Players> {
    let playerskey = playersKey(room);
    let ids: Players = await redis.lrange(playerskey, 0, -1);
    return ids;
}

export async function addPlayer(room: string, player: string) {
    let playerskey = playersKey(room);
    await redis.rpush(playerskey, player);
}
