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
exports.addPlayer = exports.getPlayers = void 0;
const constant_1 = require("../constant");
const redis_1 = __importDefault(require("../redis/redis"));
function getPlayers(room) {
    return __awaiter(this, void 0, void 0, function* () {
        let playerskey = (0, constant_1.playersKey)(room);
        let ids = yield redis_1.default.lrange(playerskey, 0, -1);
        return ids;
    });
}
exports.getPlayers = getPlayers;
function addPlayer(room, player) {
    return __awaiter(this, void 0, void 0, function* () {
        let playerskey = (0, constant_1.playersKey)(room);
        yield redis_1.default.rpush(playerskey, player);
    });
}
exports.addPlayer = addPlayer;
