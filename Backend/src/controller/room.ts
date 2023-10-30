import { Request, Response } from "express"
import redis, { Key, roomExpire } from "../config/redis";
import { Room } from "../models/room";

export const createRoom = async (req: Request, res: Response) => {
    let { userName, roomName }: { userName: string, roomName: string } = req.body;
    try {
        let exist = await redis.exists(Key("rooms", roomName));
        if (exist) {
            throw new Error("Room already exists");
        }

        let room = new Room(roomName);
        room.join(userName);

        let key = Key("rooms", room.name);
        await redis.hset(key, room.stringify());
        await redis.expire(key, roomExpire);

        res.json({ room: room.name })
    } catch (e: any) {
        res.status(400).json({ error: e.message });
    }
}


export const joinRoom = async (req: Request, res: Response) => {
    let { userName, roomName }: { userName: string, roomName: string } = req.body;
    try {
        let key = Key("rooms", roomName)
        let exist = await redis.hgetall(key);
        if (Object.keys(exist).length == 0) {
            throw new Error("Room not found");
        }
        let room = Room.parse(exist);
        room.join(userName);
        
        await redis.hset(key, "players", JSON.stringify(room.players));
        await redis.expire(key, roomExpire);

        res.json({ room: room.name })
    } catch (e: any) {
        res.status(400).json({ error: e.message });
    }
}


