import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import helmet from "helmet";
import morgan from "morgan";

import { createServer } from "http";
import { Server, Socket } from "socket.io";
import { verifyAccessToken } from "./middleware/validateToken";
import mongoose, { isValidObjectId, ObjectId } from "mongoose";
import appRouter from "./routers";
import { Chat } from "./model/Chat";
import { Message } from "./model/Message";
import { User } from "./model/User";

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

// track online users
const onlineUsers = new Set<string>();

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

io.on("connection", async (socket) => {
  const userId = socket.data.userId;

  if (!userId) return socket.disconnect();

  onlineUsers.add(userId);
  console.log(`⚡️ Socket connected: ${userId}`);

  // Update message status for pending messages when user comes online
  try {
    // Find chats where this user is a participant
    const userChats = await Chat.find({
      participants: mongoose.Types.ObjectId.createFromHexString(userId),
    }).select("_id");

    const chatIds = userChats.map((chat) => chat._id);

    // Find all messages sent to these chats that are still in "sent" status
    // and not sent by this user
    const pendingMessages = await Message.find({
      chat: { $in: chatIds },
      sender: { $ne: userId },
      status: "sent",
    });

    // Update all messages to "delivered"
    for (const message of pendingMessages) {
      await Message.findByIdAndUpdate(message._id, { status: "delivered" });
      io.emit("message:status", {
        messageId: message._id,
        status: "delivered",
      });
    }
  } catch (err) {
    console.error("Error updating message status on user connection:", err);
  }

  const user = await User.findById(userId).select("friends");
  const friendList = user?.friends;

  if (friendList.length > 0) {
    // Send online status of friends to the connected user
    const friendStatuses = await Promise.all(
      friendList.map(async (friendId: ObjectId) => {
        const isOnline = onlineUsers.has(friendId.toString());

        if (isOnline) {
          return { userId: friendId, isOnline: true };
        } else {
          // Get last seen for offline friends
          const friend = await User.findById(friendId).select("lastSeen");
          return {
            userId: friendId,
            isOnline: false,
            lastSeen: friend?.lastSeen,
          };
        }
      })
    );

    // Send friend statuses to the user
    socket.emit("friends:status", friendStatuses);

    // Notify friends that this user is online
    friendList.forEach((friendId: ObjectId) => {
      socket.to(friendId.toString()).emit("friend:status", {
        userId,
        isOnline: true,
      });
    });
  }

  // Join personal room for notifications
  socket.join(userId);

  // Handle joining a chat
  socket.on("join:chat", async (chatId: string, ack: Function) => {
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
      const { chatId, content, tempId, attachment } = data;
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
        attachment,
      });

      const populatedMessage = await message.populate({
        path: "sender",
        select: "name avatarUrl",
      });

      // Update last message
      chat.lastMessage = message._id;
      await chat.save();

      // Broadcast to room
      io.to(chatId).emit("message:new", { tempId, message: populatedMessage });

      // Check if recipients are online and mark delivered immediately
      const recipients = chat.participants.filter(
        (participant: ObjectId) => participant.toString() !== userId
      );

      for (const recipient of recipients) {
        const recipientId = recipient.toString();
        if (onlineUsers.has(recipientId)) {
          // Update status to delivered if recipient is online
          await Message.findByIdAndUpdate(message._id, { status: "delivered" });
          io.emit("message:status", {
            messageId: message._id,
            status: "delivered",
          });
          break; // Only need to update once for any online recipient
        }
      }

      ack({ status: 201, data: message });
    } catch (err: any) {
      console.log("message:send error", err);
      ack({ status: 500, error: "Internal server error" });
    }
  });

  // mark sent
  socket.on("message:sent", async ({ messageId }) => {
    await Message.findByIdAndUpdate(messageId, { status: "sent" });
    io.emit("message:status", { messageId, status: "sent" });
  });

  // mark delivered
  socket.on("message:delivered", async ({ messageId }) => {
    await Message.findByIdAndUpdate(messageId, { status: "delivered" });
    io.emit("message:status", { messageId, status: "delivered" });
  });

  // mark read
  socket.on("message:read", async ({ messageId }) => {
    await Message.findByIdAndUpdate(messageId, { status: "read" });
    io.emit("message:status", { messageId, status: "read" });
  });

  // mark failed
  socket.on("message:failed", async ({ messageId }) => {
    await Message.findByIdAndUpdate(messageId, { status: "failed" });
    io.emit("message:status", { messageId, status: "failed" });
  });

  // Handle calling
  socket.on("call", async (data: any, ack: Function) => {
    try {
      const { caller, receiver } = data;
      // Validate chat
      if (!isValidObjectId(caller._id))
        return ack({ status: 400, error: "Invalid callerId" });

      // Broadcast to room
      io.to(caller._id).emit("call:incoming", data);
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

  // Handle typing start
  socket.on("typing", (chatId) => {
    socket.to(chatId).emit("typing");
  });

  // Handle typing stop
  socket.on("typing:stop", (chatId) => {
    socket.to(chatId).emit("typing:stop");
  });

  socket.on("disconnect", async () => {
    if (!userId) return;

    // Remove from online users
    onlineUsers.delete(userId);
    console.log(`🔌 Socket disconnected: ${userId}`);

    // Update last seen timestamp in database
    const lastSeen = new Date();
    await User.findByIdAndUpdate(userId, { lastSeen });

    // Notify friends that user went offline
    const user = await User.findById(userId).select("friends");
    if (user && user.friends) {
      user.friends.forEach((friendId: ObjectId) => {
        socket.to(friendId.toString()).emit("friend:status", {
          userId,
          isOnline: false,
          lastSeen,
        });
      });
    }
  });
});

app.set("io", io);

export default app;
