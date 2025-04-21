"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AuthRoute_1 = __importDefault(require("./AuthRoute"));
const UserRoute_1 = __importDefault(require("./UserRoute"));
const FriendRequestRoute_1 = __importDefault(require("./FriendRequestRoute"));
const ChatRoute_1 = __importDefault(require("./ChatRoute"));
const appRouter = (0, express_1.Router)();
appRouter.use("/auth", AuthRoute_1.default);
appRouter.use("/users", UserRoute_1.default);
appRouter.use("/friend-request", FriendRequestRoute_1.default);
appRouter.use("/chat", ChatRoute_1.default);
exports.default = appRouter;
