import redis, { Key, playerKey, playersKey } from "../config/redis";
import { Player } from "./player";

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

    async join(player: string) {

        let playerkey = playerKey(this.name, player);
        let exist = await redis.exists(playerkey);

        if (!exist) {
            let playerIds: Array<string> = await Player.getPlayers(this.name);

            if (playerIds.length >= 2) {
                throw new Error("Room is full");
            }

            let playerskey = playersKey(this.name);
            await redis.rpush(playerskey, player);

            if (playerIds.length === 0) {
                let newPlayer = new Player(player, 'O');
                await newPlayer.save(this.name);
            } else {
                let oldChoice = await Player.getPlayerChoice(this.name, playerIds[0]);
                let newPlayer = new Player(player, oldChoice === 'O' ? 'X' : 'O');
                await newPlayer.save(this.name);
            }
        }
    }
}



