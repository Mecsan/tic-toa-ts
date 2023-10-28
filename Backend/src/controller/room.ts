import { Request, Response } from "express"
import { Room, rooms } from "../models/room";

export const createRoom = async (req: Request, res: Response) => {
    let { userName, roomName }: { userName: string, roomName: string } = req.body;
    try {
        let room: Room = rooms.getRoom(roomName) as Room;
        if (room) {
            throw new Error("Room already exists");
        }
        room = new Room(roomName);
        room.join(userName);
        rooms.addRoom(room);
        res.json({ room: room.name })
    } catch (e: any) {
        res.status(400).json({ error: e.message });
    }
}


export const joinRoom = async (req: Request, res: Response) => {
    let { userName, roomName }: { userName: string, roomName: string } = req.body;
    try {
        let room: Room = rooms.getRoom(roomName) as Room;
        if (!room) {
            throw new Error("Room not found");
        }
        room.join(userName);
        res.json({ room: room.name })
    } catch (e: any) {
        res.status(400).json({ error: e.message });
    }
}


