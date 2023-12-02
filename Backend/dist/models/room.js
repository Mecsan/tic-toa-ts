"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Room = exports.initTurn = exports.initBoard = void 0;
const constant_1 = require("../constant");
const redis_1 = __importDefault(require("../redis/redis"));
const player_1 = require("./player");
const players_1 = require("./players");
exports.initBoard = ["", "", "", "", "", "", "", "", ""];
exports.initTurn = 'O';
class Room {
    constructor(name) {
        this.name = name;
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
    static addPlayerToRoom(player, room) {
        return __awaiter(this, void 0, void 0, function* () {
            let playerkey = (0, constant_1.playerKey)(room, player);
            let exist = yield redis_1.default.exists(playerkey);
            if (!exist) {
                let playerIds = yield (0, players_1.getPlayers)(room);
                if (playerIds.length >= 2) {
                    throw new Error("Room is full");
                }
                if (playerIds.length === 0) {
                    let newPlayer = new player_1.Player(player, 'O');
                    yield newPlayer.save(room);
                }
                else {
                    let playerkey = (0, constant_1.playerKey)(room, playerIds[0]);
                    let oldChoice = yield redis_1.default.hget(playerkey, "choice");
                    let newPlayer = new player_1.Player(player, oldChoice === 'O' ? 'X' : 'O');
                    yield newPlayer.save(room);
                }
                yield (0, players_1.addPlayer)(room, player);
            }
        });
    }
}
exports.Room = Room;
