import { Request, Response } from "express";
import { isValidObjectId } from "mongoose";
import { Message } from "../model/Message";
import { Chat } from "../model/Chat";

const getChatMessages = async (req: Request, res: Response) => {
  try {
    const { chatId, before, limit } = req.body;
    const userId = req.userId;

    if (!isValidObjectId(chatId)) {
      return res.status(400).json({ message: "Invalid chatId" });
    }

    const chat = await Chat.findOne({
      _id: chatId,
      participants: userId,
    });

    if (!chat) {
      return res.status(403).json({
        message: "Access denied. You are not a participant in this chat.",
      });
    }

    const query: any = { chat: chatId };
    if (before) query.createdAt = { $lt: new Date(before) };

    const recentMessages = await Message.find(query)
      .populate({ path: "sender", select: "name avatarUrl" })
      .sort({ createdAt: -1 })
      .limit(limit || 20);

    return res.status(200).json(recentMessages.reverse());
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ message: "Failed to fetch messages" });
  }
};

export default {
  getAllChatMessages: getChatMessages,
};
