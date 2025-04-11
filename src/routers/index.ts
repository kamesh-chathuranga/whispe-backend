import { Router } from "express";
import authRouter from "./authRouter";

const appRouter = Router();

appRouter.use("/auth", authRouter);
// appRouter.use("/users");

export default appRouter;
