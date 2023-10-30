"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Room = exports.initTurn = exports.initBoard = void 0;
exports.initBoard = ["", "", "", "", "", "", "", "", ""];
exports.initTurn = 'O';
class Room {
    constructor(name) {
        this.name = name;
        this.players = [];
        this.board = exports.initBoard;
        this.status = "initial";
        this.turn = exports.initTurn;
    }
    static parse(obj) {
        let ret = Object.create(Room.prototype);
        for (let key in obj) {
            try {
                ret[key] = JSON.parse(obj[key]);
            }
            catch (e) {
                ret[key] = obj[key];
            }
        }
        return ret;
    }
    stringify() {
        let ret = Object.create({});
        for (let key in this) {
            if (typeof this[key] == 'object') {
                ret[key] = JSON.stringify(this[key]);
            }
            else {
                ret[key] = this[key];
            }
        }
        return ret;
    }
    join(player) {
        let f = this.players.find(p => p.name === player);
        if (!f) {
            if (this.players.length >= 2) {
                throw new Error("Room is full");
            }
            if (this.players.length === 0) {
                this.players.push({ name: player, choice: 'O', isOnline: false, cn: 0 });
            }
            else {
                this.players.push({ name: player, choice: 'X', isOnline: false, cn: 0 });
            }
        }
    }
    getPlayer(name) {
        return this.players.find(p => p.name === name);
    }
}
exports.Room = Room;
