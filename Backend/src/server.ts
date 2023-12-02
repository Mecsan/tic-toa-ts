// import cluster from "node:cluster";
// import os from 'node:os';
// import app from "./app";
// import { socketSetup } from "./socket";

// let cpus = os.cpus().length;

// function setupPrimary() {
//     for (let i = 0; i < cpus/2; i++) {
//         cluster.fork();
//     }

//     cluster.on('exit', (worker, code, signal) => {
//         console.log(`Worker ${worker.process.pid} died`);
//         // When any worker dies, restart it.
//         cluster.fork();
//     });
// }

// if (cluster.isPrimary) {
//     setupPrimary();
// } else {
//     const port = process.env.PORT || 3000;
//     const server = app.listen(port, () => {
//         console.log(`server running process:${process.pid} on http://localhost:${port}`)
//     })

//     socketSetup(server);
// }
