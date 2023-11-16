"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Room = exports.initTurn = exports.initBoard = void 0;
const redis_1 = __importStar(require("../config/redis"));
const player_1 = require("./player");
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
    join(player) {
        return __awaiter(this, void 0, void 0, function* () {
            let playerkey = (0, redis_1.playerKey)(this.name, player);
            let exist = yield redis_1.default.exists(playerkey);
            if (!exist) {
                let playerIds = yield player_1.Player.getPlayers(this.name);
                if (playerIds.length >= 2) {
                    throw new Error("Room is full");
                }
                let playerskey = (0, redis_1.playersKey)(this.name);
                yield redis_1.default.rpush(playerskey, player);
                if (playerIds.length === 0) {
                    let newPlayer = new player_1.Player(player, 'O');
                    yield newPlayer.save(this.name);
                }
                else {
                    let oldChoice = yield player_1.Player.getPlayerChoice(this.name, playerIds[0]);
                    let newPlayer = new player_1.Player(player, oldChoice === 'O' ? 'X' : 'O');
                    yield newPlayer.save(this.name);
                }
            }
        });
    }
}
exports.Room = Room;
