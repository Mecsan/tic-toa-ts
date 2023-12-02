export const Key = (...args: any) => "tic-toa-ts:" + args.join(":");

// tic-toa-ts:rooms:${room1}
export const roomKey = (room: string) => Key("rooms", room);

// tic-toa-ts:players:${room1}:${player1}
export const playerKey = (room: string, player: string) => Key("players", room, player);

// tic-toa-ts:rooms:${room1}:players
export const playersKey = (room: string) => Key("rooms", room, "players");

export const roomExpire = 30 * 60;//30 minutes

export const CHANNELS = {
    EXPIRED: "__keyevent@0__:expired",
    ROOM: "channel:room"
}