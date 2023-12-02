"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const redis_1 = __importDefault(require("./redis"));
class PubSub {
    constructor() {
        this.pubClient = redis_1.default;
        this.subClient = redis_1.default.duplicate();
    }
    subscribe(channel) {
        this.subClient.subscribe(channel, (err, cn) => {
            if (err) {
                console.log(`faild to subscribe for ${channel} channel`, err);
                return;
            }
            console.log(`${channel} subscribed`);
        });
    }
    publish(channel, message) {
        console.log("publishing from " + process.pid);
        this.pubClient.publish(channel, message);
    }
    onMessage(cb) {
        this.subClient.on('message', (EventChannel, message) => {
            cb(EventChannel, message);
        });
    }
}
let pubSub = new PubSub();
exports.default = pubSub;
