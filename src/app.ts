import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import helmet from "helmet";
import morgan from "morgan";

import { createServer } from "http";
import { Server } from "socket.io";
import appRouter from "./routers";

const app = express();
export const httpServer = createServer(app);

app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(helmet());
app.use(morgan("dev"));

app.use("/api/v1", appRouter);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("A client connected:", socket.id);

  socket.on("join", (userId: string) => {
    socket.join(userId);
    console.log(`User ${userId} joined with socket ${socket.id}`);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

app.set("io", io);

export default app;
