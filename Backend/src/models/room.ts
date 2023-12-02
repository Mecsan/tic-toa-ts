import { playerKey } from "../constant";
import redis from "../redis/redis";
import { Player } from "./player";
import { addPlayer, getPlayers } from "./players";

export type Choice = 'X' | 'O' | '';
export type board = [Choice, Choice, Choice, Choice, Choice, Choice, Choice, Choice, Choice];

export let initBoard: board = ["", "", "", "", "", "", "", "", ""]
export let initTurn: Choice = 'O'

export type gameStatus = "initial" | "playing" | "finished";
export interface room {
    name: string;
    board: board;
    status: gameStatus;
    turn: Choice;
}
export class Room implements room {
    name: string;
    board: board;
    status: gameStatus;
    turn: Choice;

    constructor(name: string) {
        this.name = name;
        this.board = initBoard;
        this.status = "initial";
        this.turn = initTurn;
    }

    static parse(obj: any): Room {
        let ret = Object.create(Room.prototype);
        for (let key in obj) {
            try {
                ret[key] = JSON.parse(obj[key]);
            } catch (e) {
                ret[key] = obj[key]
            }
        }
        return ret;
    }

    stringify() {
        let ret = Object.create({});
        for (let key in this) {
            if (typeof this[key] == 'object') {
                ret[key] = JSON.stringify(this[key]);
            } else {
                ret[key] = this[key]
            }
        }
        return ret;
    }

    static async addPlayerToRoom(player: string, room: string) {

        let playerkey = playerKey(room, player);
        let exist = await redis.exists(playerkey);

        if (!exist) {

            let playerIds = await getPlayers(room);
            if (playerIds.length >= 2) {
                throw new Error("Room is full");
            }

            if (playerIds.length === 0) {
                let newPlayer = new Player(player, 'O');
                await newPlayer.save(room);
            } else {
                let playerkey = playerKey(room, playerIds[0]);
                let oldChoice = await redis.hget(playerkey, "choice");
                let newPlayer = new Player(player, oldChoice === 'O' ? 'X' : 'O');
                await newPlayer.save(room);
            }

            await addPlayer(room, player);
        }
    }
}



