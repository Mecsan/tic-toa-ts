import cluster from "node:cluster";
import os from 'node:os';

let cpus = os.cpus().length;

function setupPrimary() {
    for (let i = 0; i < cpus; i++) {
        cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died`);
        // When any worker dies, restart it.
        cluster.fork();
    });
}

if (cluster.isPrimary) {
    setupPrimary();
} else {
    import("./server");
}
