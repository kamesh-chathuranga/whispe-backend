import express from "express";

import UserController from "../controller/UserController";

const router = express.Router();

router.get("/", UserController.getAllUsers);

router.get("/:userId", UserController.getUserById);

export default router;
