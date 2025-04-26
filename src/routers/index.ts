import { Router } from "express";
import AuthRoute from "./AuthRoute";
import UserRoute from "./UserRoute";
import FriendRequestRoute from "./FriendRequestRoute";
import ChatRoute from "./ChatRoute";
import MessageRoute from "./MessageRoute";

const appRouter = Router();

appRouter.use("/auth", AuthRoute);
appRouter.use("/users", UserRoute);
appRouter.use("/friend-request", FriendRequestRoute);
appRouter.use("/chat", ChatRoute);
appRouter.use("/messages", MessageRoute);

export default appRouter;
