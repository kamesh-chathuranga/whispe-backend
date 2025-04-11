import { Router } from "express";
import AuthController from "../controller/AuthController";
import {
  validateUserLoginRequest,
  validateUserRegisterRequest,
} from "../middleware/validation/auth-validation";

const authRouter = Router();

authRouter.post(
  "/login",
  validateUserLoginRequest,
  AuthController.logInCurrentUser
);

authRouter.post(
  "/register",
  validateUserRegisterRequest,
  AuthController.registerCurrentUser
);

export default authRouter;
