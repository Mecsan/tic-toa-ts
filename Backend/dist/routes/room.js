"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const room_1 = require("../controller/room");
const router = (0, express_1.Router)();
router.post("/join", room_1.joinRoom);
router.post("/create", room_1.createRoom);
exports.default = router;
