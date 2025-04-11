import express from "express";

import FriendRequestController from "../controller/FriendRequestController";

const router = express.Router();

router.get("/send-request", FriendRequestController.sendFriendRequest);

export default router;
