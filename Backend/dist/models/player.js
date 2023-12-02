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
exports.Player = void 0;
const constant_1 = require("../constant");
const redis_1 = __importDefault(require("../redis/redis"));
class Player {
    constructor(name, choice) {
        this.name = name;
        this.choice = choice;
        this.isOnline = false;
        this.cn = 0;
    }
    save(room) {
        return __awaiter(this, void 0, void 0, function* () {
            let key = (0, constant_1.playerKey)(room, this.name);
            yield redis_1.default.hset(key, this);
        });
    }
}
exports.Player = Player;
