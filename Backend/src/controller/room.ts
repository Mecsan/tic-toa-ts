import { Request, Response } from "express"
import redis, { roomExpire, roomKey } from "../redis/redis";
import { Room } from "../models/room";

export const createRoom = async (req: Request, res: Response) => {
    let { userName, roomName }: { userName: string, roomName: string } = req.body;
    try {
        let key = roomKey(roomName);
        let exist = await redis.exists(key);
        if (exist) {
            throw new Error("Room already exists");
        }

        let room = new Room(roomName);
        await redis.hset(key, room.stringify());
        await redis.expire(key, roomExpire);

        await Room.addPlayerToRoom(userName, roomName)

        res.json({ room: room.name })
    } catch (e: any) {
        console.log(e)
        res.status(400).json({ error: e.message });
    }
}


export const joinRoom = async (req: Request, res: Response) => {
    let { userName, roomName }: { userName: string, roomName: string } = req.body;
    try {
        let key = roomKey(roomName);
        let exist = await redis.exists(key);
        if (!exist) {
            throw new Error("Room not found");
        }
  
        await Room.addPlayerToRoom(userName, roomName)
        await redis.expire(key, roomExpire);
        
        res.json({ room: roomName })
    } catch (e: any) {
        console.log(e)
        res.status(400).json({ error: e.message });
    }
}


