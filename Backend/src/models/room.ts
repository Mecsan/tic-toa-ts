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

    getPlayer(name: string) {
        return this.players.find(p => p.name === name);
    }
}



