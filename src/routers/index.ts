import { Router } from "express";
import AuthRoute from "./AuthRoute";
import UserRoute from "./UserRoute";

const appRouter = Router();

appRouter.use("/auth", AuthRoute);
appRouter.use("/users", UserRoute);

export default appRouter;
