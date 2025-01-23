import { Request, Response } from "express";
import { prisma } from "../utils/PrismaClient";

const createMessage = async (req: Request, res: Response) => {
  try {
    const { from, to, message } = req.body;

    if (!from || !to || !message) {
      return res.status(400).json({ message: "Invalid request" });
    }

    const isOnlineUser = global.onlineUsers.get(to);
    const newMessage = await prisma.message.create({
      data: {
        message,
        author: { connect: { id: from } },
        receiver: { connect: { id: to } },
        status: isOnlineUser ? "delivered" : "sent",
      },
      include: {
        author: true,
        receiver: true,
      },
    });
    return res.status(201).json(newMessage);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to send message" });
  }
};

export default {
  createMessage,
};
