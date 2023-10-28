import { Request, Response } from "express";

export type Choice = 'X' | 'O' | '';
export type board = [Choice, Choice, Choice, Choice, Choice, Choice, Choice, Choice, Choice];

export let initBoard: board = ["", "", "", "", "", "", "", "", ""]
export let initTurn: Choice = 'O'


export type gameStatus = "initial" | "playing" | "finished";

export interface player {
    name: string,
    choice: Choice,
    isOnline: boolean,
    cn: number
}

export interface room {
    name: string;
    players: player[];
    board: board;
    status: gameStatus;
    turn: Choice;
}
export class Room implements room {
    name: string;
    players: player[];
    board: board;
    status: gameStatus;
    turn: Choice;

    constructor(name: string) {
        this.name = name;
        this.players = [];
        this.board = initBoard;
        this.status = "initial";
        this.turn = initTurn;
    }

    join(player: string) {
        let f = this.players.find(p => p.name === player);
        if (!f) {
            if (this.players.length >= 2) {
                throw new Error("Room is full");
            }
            if (this.players.length === 0) {
                this.players.push({ name: player, choice: 'O', isOnline: false, cn: 0 });
            } else {
                this.players.push({ name: player, choice: 'X', isOnline: false, cn: 0 });
            }
        }
    }

    leave(player: player) {
        this.players = this.players.filter(p => p.name !== player.name);
    }

    getPlayer(name: string) {
        return this.players.find(p => p.name === name);
    }
}


class Rooms {
    rooms: Room[];
    constructor() {
        this.rooms = [];
    }

    addRoom(room: Room) {
        this.rooms.push(room);
    }

    getRoom(name: string) {
        return this.rooms.find(room => room.name === name);
    }

    getRooms() {
        return this.rooms;
    }
}

let rooms = new Rooms();


export const getDb = (req: Request, res: Response) => {
    let query = req.query.token;
    if (query && query == process.env.DB_TOKEN) {
        return res.json(rooms);
    }
    return res.json({
        msg: "unauthorized"
    })
}
export { rooms };

