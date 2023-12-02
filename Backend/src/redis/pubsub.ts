import Redis from "ioredis";
import redis from "./redis";

class PubSub {
    private pubClient: Redis
    private subClient: Redis

    constructor() {
        this.pubClient = redis
        this.subClient = redis.duplicate()
    }

    subscribe(channel: string) {
        this.subClient.subscribe(channel, (err, cn) => {
            if (err) {
                console.log(`faild to subscribe for ${channel} channel`, err);
                return;
            }
            console.log(`${channel} subscribed`);
        })
    }

    publish(channel: string, message: string | Buffer) {
        console.log("publishing from " + process.pid)
        this.pubClient.publish(channel, message);
    }


    onMessage(cb: (channle: string, message: string) => void) {
        this.subClient.on('message', (EventChannel: string, message: string) => {
            cb(EventChannel, message);
        })
    }
}

let pubSub = new PubSub();

export default pubSub;