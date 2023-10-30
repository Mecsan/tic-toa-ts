"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const room_1 = __importDefault(require("./routes/room"));
const socket_1 = require("./socket");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use("/api/room", room_1.default);
if (process.env.NODE_ENV == 'production') {
    let staticPath = path_1.default.join(__dirname, '..', '..', 'Frontend', 'dist');
    app.use(express_1.default.static(staticPath));
    app.get('*', (req, res) => {
        res.sendFile(path_1.default.join(staticPath, 'index.html'));
    });
}
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
    console.log("server running on http://localhost:" + port);
});
(0, socket_1.socketSetup)(server);
