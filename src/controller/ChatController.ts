import { Request, Response } from "express";
import { Chat } from "../model/Chat";
import { IAttachment, Message } from "../model/Message";
import { isValidObjectId } from "mongoose";
import {
  generateUploadURL,
  generateAccessURL,
  mapMimeTypeToAttachmentType,
} from "../util/s3Service";

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

const getUserChatMessages = async (req: Request, res: Response) => {
  try {
    const chatId = req.params.chatId;
    const limit = parseInt((req.query.limit as string) || "20", 10);
    const before = req.query.before
      ? new Date(req.query.before as string)
      : undefined;
    const userId = req.userId;

    if (!isValidObjectId(chatId))
      return res.status(400).json({ message: "Invalid chatId" });

    const chat = await Chat.findOne({
      _id: chatId,
      participants: userId,
    }).lean();
    if (!chat) return res.status(403).json({ message: "Access denied." });

    const filter: any = { chat: chatId };
    if (before) filter.createdAt = { $lt: before };

    // find messages, newest first, then reverse to oldest→newest
    const docs = await Message.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate({ path: "sender", select: "name avatarUrl" })
      .lean();

    const messages = docs.reverse();
    const nextCursor =
      docs.length === limit
        ? docs[0].createdAt.toISOString() // docs[0] is the *newest* of the batch
        : null;

    return res.json({ messages, nextCursor });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ message: "Failed to fetch messages" });
  }
};

const uploadMediaFiles = async (req: Request, res: Response) => {
  try {
    // Example: chats/:chatId/media/upload

    const chatId = req.params.chatId;
    const userId = req.userId;

    const chat = await Chat.findOne({
      _id: chatId,
      participants: userId,
    });

    if (!chat) {
      return res.status(403).json({
        message: "Access denied. You are not a participant in this chat.",
      });
    }

    const file: { filename: string; mimeType: string; size: number } = req.body;

    const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
    const UPLOADS_PREFIX = "uploads/";

    const { filename, mimeType, size } = file;

    if (!filename || !mimeType || size === undefined) {
      return res
        .status(400)
        .send("Missing file metadata (filename, mimeType, size)");
    }

    if (size > MAX_FILE_SIZE) {
      return res.status(400).send("File size exceeds limit");
    }

    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9_.-]/g, "_");
    const objectKey = `${UPLOADS_PREFIX}${chatId}/${userId}-${Date.now()}-${sanitizedFilename}`;

    const url = await generateUploadURL(objectKey, mimeType);

    if (!url) {
      return res.status(500).send("Failed to generate upload URL");
    }

    const type = mapMimeTypeToAttachmentType(mimeType);

    const result = { filename, url, objectKey, mimeType, size, type };

    return res.status(200).json(result);
  } catch (error) {
    console.log("Error generating upload URL:", error);
    return res.status(500).send("Error generating upload URL");
  }
};

const getChatMediaFiles = async (req: Request, res: Response) => {
  try {
    // Example: chats/:chatId/:messageId/media/view

    const chatId = req.params.chatId;
    const messageId = req.params.messageId;
    const userId = req.userId;

    const chat = await Chat.findOne({
      _id: chatId,
      participants: userId,
    });

    if (!chat) {
      return res.status(403).json({
        message: "Access denied. You are not a participant in this chat.",
      });
    }

    const message = await Message.findOne({ _id: messageId });

    if (!message) {
      return res.status(404).send("Attachment not found");
    }

    const attachment: IAttachment = message.attachment;

    if (!attachment) {
      return res.status(404).send("Attachment details incomplete");
    }

    if (!attachment.objectKey) {
      return res.status(400).send("Missing objectKey");
    }

    const url = await generateAccessURL(
      attachment.objectKey,
      attachment.mimeType
    );

    if (!url) {
      return res.status(500).send("Failed to generate access URL");
    }

    return res.status(200).json({ url });
  } catch (error) {
    console.log("Error generating access URL:", error);
    return res.status(500).send("Error generating access URL");
  }
};

export default {
  getUserChats,
  getUserChatMessages,
  uploadMediaFiles,
  getChatMediaFiles,
};
