import express from "express";

import { jwtParse } from "../middleware/validateToken";
import MessageController from "../controller/MessageController";

const router = express.Router();

router.post("/", jwtParse, MessageController.getChatMessages);
router.post("/upload", jwtParse, MessageController.uploadMediaFiles);

export default router;
