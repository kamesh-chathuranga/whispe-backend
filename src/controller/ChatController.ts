import { Request, Response } from "express";
import { Chat } from "../model/Chat";
import { Message } from "../model/Message";

const getUserChats = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const chats = await Chat.find({ participants: userId })
      .sort({ updatedAt: -1 })
      .populate({
        path: "participants",
        select: "_id name avatarUrl",
      });

    const chatDataWithLastMessages = await Promise.all(
      chats.map(async (chat) => {
        const lastMessage = await Message.findOne({ chat: chat._id })
          .populate("sender", "name avatarUrl")
          .sort({ createdAt: -1 })
          .limit(1);

        return {
          _id: chat._id,
          partner:
            chat.participants[0]._id.toString() === userId
              ? chat.participants[1]
              : chat.participants[0],
          lastMessage,
        };
      })
    );

    return res.status(200).json(chatDataWithLastMessages);
  } catch (err) {
    console.log("Error get chats" + err);
    return res.status(500).json({ message: "Failed to fetch user chat" });
  }
};

export default { getUserChats };
