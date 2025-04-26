import express from "express";

import { jwtParse } from "../middleware/validateToken";
import MessageController from "../controller/MessageController";

const router = express.Router();

router.post("/", jwtParse, MessageController.getAllChatMessages);

export default router;
