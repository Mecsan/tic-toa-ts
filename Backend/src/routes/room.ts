import { Router } from "express";
import { createRoom, joinRoom } from "../controller/room";

const router = Router();

router.post("/join",joinRoom);

router.post("/create",createRoom);

export default router;