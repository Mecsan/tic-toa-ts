"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CHANNELS = exports.roomExpire = exports.playersKey = exports.playerKey = exports.roomKey = exports.Key = void 0;
const Key = (...args) => "tic-toa-ts:" + args.join(":");
exports.Key = Key;
// tic-toa-ts:rooms:${room1}
const roomKey = (room) => (0, exports.Key)("rooms", room);
exports.roomKey = roomKey;
// tic-toa-ts:players:${room1}:${player1}
const playerKey = (room, player) => (0, exports.Key)("players", room, player);
exports.playerKey = playerKey;
// tic-toa-ts:rooms:${room1}:players
const playersKey = (room) => (0, exports.Key)("rooms", room, "players");
exports.playersKey = playersKey;
exports.roomExpire = 30 * 60; //30 minutes
exports.CHANNELS = {
    EXPIRED: "__keyevent@0__:expired",
    ROOM: "channel:room"
};
