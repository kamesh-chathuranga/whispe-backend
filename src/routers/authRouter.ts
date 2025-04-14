import { Router } from "express";
import AuthController from "../controller/AuthController";
import {
  validateUserLoginRequest,
  validateUserRegisterRequest,
} from "../middleware/validation/auth-validation";
import { jwtParse } from "../middleware/validateToken";

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

authRouter.post("/logout", jwtParse, AuthController.logOutCurrentUser);

authRouter.get("/refresh", AuthController.validateRefreshToken);

export default authRouter;
