import { Request, Response } from "express";
import { Chat } from "../model/ChatModel";

export const getUserChats = async (req: Request, res: Response) => {
  const userId = req.userId;

  try {
    const chats = await Chat.find({ participants: userId })
      .sort({ updatedAt: -1 }) // latest chats first
      .populate({
        path: "participants",
        select: "_id name avatarUrl",
      });

    // Optionally: Add latest message to each chat
    //   const chatDataWithLastMessages = await Promise.all(
    //     chats.map(async (chat) => {
    //       const lastMessage = await Message.findOne({ chat: chat._id })
    //         .sort({ createdAt: -1 })
    //         .limit(1);

    //       return {
    //         ...chat.toObject(),
    //         lastMessage,
    //       };
    //     })
    //   );

    return res.status(200).json(chats);
  } catch (err) {
    console.error("Error fetching chats:", err);
    return res.status(500).json({ message: "Failed to fetch user chat" });
  }
};

export default { getUserChats };
