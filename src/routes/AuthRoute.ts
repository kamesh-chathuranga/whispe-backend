import express from "express";
import AuthController from "../controller/AuthController";

const router = express.Router();

router.post("/register", AuthController.registerCurrentUser);

router.post("/login", AuthController.logInCurrentUser);

router.post("/logout", AuthController.logOutCurrentUser);

router.get("/refresh-token", AuthController.validateRefreshToken);

export default router;
