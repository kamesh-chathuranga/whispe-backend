import express from "express";

import { jwtParse } from "../middleware/validateToken";
import ChatController from "../controller/ChatController";

const router = express.Router();

router.get("/", jwtParse, ChatController.getUserChats);
router.get("/:chatId/messages", jwtParse, ChatController.getUserChatMessages);
router.post("/:chatId/media/upload", jwtParse, ChatController.uploadMediaFiles);

export default router;
