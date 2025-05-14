import { Router } from "express";
import AuthRoute from "./AuthRoute";
import UserRoute from "./UserRoute";
import FriendRequestRoute from "./FriendRequestRoute";
import ChatRoute from "./ChatRoute";

const appRouter = Router();

appRouter.use("/auth", AuthRoute);
appRouter.use("/users", UserRoute);
appRouter.use("/friend-requests", FriendRequestRoute);
appRouter.use("/chats", ChatRoute);

export default appRouter;
