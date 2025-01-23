import { Request, Response } from "express";
import { prisma } from "../utils/PrismaClient";
import { onlineUsers } from "..";

const createMessage = async (req: Request, res: Response) => {
  try {
    const { from, to, message } = req.body;

    if (!from || !to || !message) {
      return res.status(400).json({ message: "Invalid request" });
    }

    const isOnlineUser = onlineUsers.get(to);
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

const getAllUserMessages = async (req: Request, res: Response) => {
  try {
    const { from, to } = req.params;
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          {
            authorId: from,
            receiverId: to,
          },
          {
            authorId: to,
            receiverId: from,
          },
        ],
      },
      orderBy: {
        id: "asc",
      },
    });

    const unreadMessages = messages
      .filter((message) => message.status !== "read" && message.authorId === to)
      .map((message) => message.id);

    await prisma.message.updateMany({
      where: {
        id: {
          in: unreadMessages,
        },
      },
      data: {
        status: "read",
      },
    });

    return res.status(200).json(messages);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to get messages" });
  }
};

export default {
  createMessage,
  getAllUserMessages,
};
