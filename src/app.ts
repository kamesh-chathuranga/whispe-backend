import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import helmet from "helmet";
import morgan from "morgan";

import { createServer } from "http";
import { Server, Socket } from "socket.io";
import appRouter from "./routers";
import { verifyAccessToken } from "./middleware/validateToken";
import mongoose, { isValidObjectId } from "mongoose";
import { Chat } from "./model/ChatModel";
import { Message } from "./model/Message";

const app = express();
export const httpServer = createServer(app);

app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(helmet());
app.use(morgan("dev"));

app.use("/health", (req, res) => {
  res.status(200).json({ message: "Server is running" });
});

app.use("/api/v1", appRouter);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Socket.IO auth middleware
io.use((socket: Socket, next) => {
  try {
    const cookies = socket.request.headers.cookie;
    if (!cookies) throw new Error("No cookies");
    const parsed = Object.fromEntries(
      cookies.split("; ").map((c) => c.split("="))
    );
    const accessToken = parsed["accessToken"];
    if (!accessToken) throw new Error("No access token");
    const payload = verifyAccessToken(accessToken);
    socket.data.userId = payload.userId;
    next();
  } catch (err) {
    next(new Error("Authentication error"));
  }
});

io.on("connection", (socket) => {
  const userId = socket.data.userId;
  console.log(`User connected: ${userId}`);

  // Join personal room for notifications
  socket.join(userId);

  // Handle joining a chat
  socket.on("joinChat", async (chatId: string, ack: Function) => {
    if (!isValidObjectId(chatId))
      return ack({ status: 400, error: "Invalid chatId" });

    const chat = await Chat.findById(chatId);
    if (!chat) return ack({ status: 404, error: "Chat not found" });

    if (
      !chat.participants.includes(
        mongoose.Types.ObjectId.createFromHexString(userId)
      )
    )
      return ack({ status: 403, error: "Not a participant" });

    socket.join(chatId);
    ack({ status: 200, data: "Joined chat" });
  });

  // Handle sending message
  socket.on("message:send", async (data: any, ack: Function) => {
    try {
      const { chatId, content, attachments } = data;
      // Validate chat
      if (!isValidObjectId(chatId))
        return ack({ status: 400, error: "Invalid chatId" });

      const chat = await Chat.findById(chatId);
      if (!chat) return ack({ status: 404, error: "Chat not found" });

      if (
        !chat.participants.includes(
          mongoose.Types.ObjectId.createFromHexString(userId)
        )
      )
        return ack({ status: 403, error: "Not a participant" });

      // Create message
      const message = await Message.create({
        sender: userId,
        chat: chatId,
        content,
        attachments,
      });

      const populatedMessage = await message.populate({
        path: "sender",
        select: "name avatarUrl", // Include other fields if needed
      });

      // Update last message
      chat.lastMessage = message._id;
      await chat.save();

      // Broadcast to room
      io.to(chatId).emit("message:new", populatedMessage);

      ack({ status: 201, data: message });
    } catch (err: any) {
      console.error("message:send error", err);
      ack({ status: 500, error: "Internal server error" });
    }
  });

  // Fetch message history
  socket.on("message:history", async (data: any, ack: Function) => {
    try {
      const { chatId, before, limit } = data;
      if (!isValidObjectId(chatId))
        return ack({ status: 400, error: "Invalid chatId" });

      const query: any = { chat: chatId };
      if (before) query.createdAt = { $lt: new Date(before) };

      const recentMessages = await Message.find(query)
        .populate({ path: "sender", select: "name avatarUrl" })
        .sort({ createdAt: -1 })
        .limit(limit || 20);
      // Return in ascending order
      ack({ status: 200, data: recentMessages.reverse() });
    } catch (err: any) {
      console.error(err);
      ack({ status: 500, error: "Server error" });
    }
  });

  // Handle vedio calling
  socket.on("call", async (data: any, ack: Function) => {
    try {
      const { caller, receiver } = data;
      // Validate chat
      if (!isValidObjectId(caller._id))
        return ack({ status: 400, error: "Invalid callerId" });

      // Broadcast to room
      io.to(receiver._id).emit("call:incoming", data);

      ack({ status: 200, data: data });
    } catch (err: any) {
      console.error("call error", err);
      ack({ status: 500, error: "Internal server error" });
    }
  });

  socket.on("webrtcSignal", (data) => {
    const { incomingCall, isCaller } = data;

    if (isCaller) {
      if (incomingCall.receiver._id) {
        io.to(incomingCall.receiver._id).emit("webrtcSignal", data);
      }
    } else {
      if (incomingCall.caller._id) {
        io.to(incomingCall.caller._id).emit("webrtcSignal", data);
      }
    }
  });

  socket.on("call:hangup", (data) => {
    const { incomingCall, hangupUserId } = data;
    let userId;

    if (incomingCall.caller._id === hangupUserId) {
      userId = incomingCall.receiver._id;
    } else {
      userId = incomingCall.caller._id;
    }

    if (userId) {
      io.to(userId).emit("call:hangup");
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

app.set("io", io);

export default app;
