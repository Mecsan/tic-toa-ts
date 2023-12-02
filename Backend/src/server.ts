import { config } from 'dotenv';
config();
import express from 'express';
import path from 'path';
import roomRouter from './routes/room';
import { socketSetup } from './socket';
import { Server as SocketServer } from 'socket.io';
import "./redis/subscribers"

const app = express();
app.use(express.json());

app.use("/api/room", roomRouter);

if (process.env.NODE_ENV == 'production') {
    let staticPath = path.join(__dirname, '..', '..', 'Frontend', 'dist');
    app.use(express.static(staticPath));
    app.get('*', (req, res) => {
        res.sendFile(path.join(staticPath, 'index.html'));
    })
}

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
    console.log(`server running process:${process.pid} on http://localhost:${port}`)
})

const io: SocketServer = socketSetup(server);

export default io;


