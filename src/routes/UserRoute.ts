import express from "express";

import UserController from "../controller/UserController";
import { validateGetUserRequest } from "../middleware/validation/user";

const router = express.Router();

router.post("/", validateGetUserRequest, UserController.getCurrentUser);

export default router;
