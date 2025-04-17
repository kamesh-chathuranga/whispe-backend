import express from "express";

import FriendRequestController from "../controller/FriendRequestController";
import { jwtParse } from "../middleware/validateToken";

const router = express.Router();

router.post("/", jwtParse, FriendRequestController.sendFriendRequest);

router.get("/sent", jwtParse, FriendRequestController.getSentFriendRequests);

router.get(
  "/received",
  jwtParse,
  FriendRequestController.getReceivedFriendRequests
);

router.delete(
  "/:requestId/cancel",
  jwtParse,
  FriendRequestController.cancelFriendRequest
);

router.post(
  "/:requestId/accept",
  jwtParse,
  FriendRequestController.acceptFriendRequest
);

export default router;
