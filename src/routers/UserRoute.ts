import express from "express";

import UserController from "../controller/UserController";
import { jwtParse } from "../middleware/validateToken";

const router = express.Router();

router.get("/me", jwtParse, UserController.getUserById);

router.get("/", jwtParse, UserController.getAllUsers);

export default router;
