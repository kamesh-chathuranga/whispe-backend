import express from "express";
import AuthController from "../controller/AuthController";
import { validateUserLoginRequest } from "../middleware/validation/auth";
import { validateUserRegisterRequest } from "../middleware/validation/user";

const router = express.Router();

router.post(
  "/sign-up",
  validateUserRegisterRequest,
  AuthController.registerCurrentUser
);

router.post(
  "/sign-in",
  validateUserLoginRequest,
  AuthController.logInCurrentUser
);

router.post("/logout", AuthController.logOutCurrentUser);

router.get("/refresh-token", AuthController.validateRefreshToken);

export default router;
