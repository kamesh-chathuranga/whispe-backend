import express from "express";
import MessageController from "../controller/MessageController";

const router = express.Router();

router.post("/new", MessageController.createMessage);

router.get("/all/:from/:to", MessageController.getAllUserMessages);

export default router;
