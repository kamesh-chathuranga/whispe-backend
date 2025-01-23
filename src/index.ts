import express from "express";
import cors from "cors";
import "dotenv/config";

import UserRoute from "./routes/UserRoute";
import MessageRoute from "./routes/MessageRoute";
import { Server } from "socket.io";

const PORT = process.env.PORT || 4000;

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/user", UserRoute);
app.use("/api/message", MessageRoute);

const server = app.listen(PORT, () => {
  console.log(`Server started at port: ${PORT}`);
});

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
  },
});

export const onlineUsers = new Map<string, string>();

io.on("connection", (socket) => {
  // global.socket = socket;

  socket.on("addUser", (userId: string) => {
    onlineUsers.set(userId, socket.id);
  });

  socket.on("send-message", (data) => {
    const socketId = onlineUsers.get(data.to);
    if (socketId) {
      socket.to(socketId).emit("received-message", data.message);
    }
  });

  // socket.on('disconnect', () => {
  //   for (const [key, value] of onlineUsers.entries()) {
  //     if (value === socket.id) {
  //       onlineUsers.delete(key);
  //       io.emit('onlineUsers', Array.from(onlineUsers.keys()));
  //       break;
  //     }
  //   }
  // });
});
