"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rooms = exports.getDb = exports.Room = exports.initTurn = exports.initBoard = void 0;
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
    leave(player) {
        this.players = this.players.filter(p => p.name !== player.name);
    }
    getPlayer(name) {
        return this.players.find(p => p.name === name);
    }
}
exports.Room = Room;
class Rooms {
    constructor() {
        this.rooms = [];
    }
    addRoom(room) {
        this.rooms.push(room);
    }
    getRoom(name) {
        return this.rooms.find(room => room.name === name);
    }
    getRooms() {
        return this.rooms;
    }
}
let rooms = new Rooms();
exports.rooms = rooms;
const getDb = (req, res) => {
    let query = req.query.token;
    if (query && query == process.env.DB_TOKEN) {
        return res.json(rooms);
    }
    return res.json({
        msg: "unauthorized"
    });
};
exports.getDb = getDb;
