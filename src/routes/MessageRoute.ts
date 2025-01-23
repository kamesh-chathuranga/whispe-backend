import express from "express";
import MessageController from "../controller/MessageController";

const router = express.Router();

router.post("/new", MessageController.createMessage);

export default router;
