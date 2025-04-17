import express from "express";

import { jwtParse } from "../middleware/validateToken";
import ChatController from "../controller/ChatController";

const router = express.Router();

router.get("/", jwtParse, ChatController.getUserChats);

export default router;
