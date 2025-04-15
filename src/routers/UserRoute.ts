import express from "express";

import UserController from "../controller/UserController";
import { jwtParse } from "../middleware/validateToken";

const router = express.Router();

router.get("/", jwtParse, UserController.getAllUsers);

router.get("/:userId", UserController.getUserById);

export default router;
