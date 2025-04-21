"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AuthController_1 = __importDefault(require("../controller/AuthController"));
const auth_validation_1 = require("../middleware/validation/auth-validation");
const validateToken_1 = require("../middleware/validateToken");
const authRouter = (0, express_1.Router)();
authRouter.post("/login", auth_validation_1.validateUserLoginRequest, AuthController_1.default.logInCurrentUser);
authRouter.post("/register", auth_validation_1.validateUserRegisterRequest, AuthController_1.default.registerCurrentUser);
authRouter.post("/logout", validateToken_1.jwtParse, AuthController_1.default.logOutCurrentUser);
authRouter.post("/refresh", AuthController_1.default.validateRefreshToken);
exports.default = authRouter;
