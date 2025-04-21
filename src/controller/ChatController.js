"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserChats = void 0;
const ChatModel_1 = require("../model/ChatModel");
const Message_1 = require("../model/Message");
const getUserChats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.userId;
    try {
        const chats = yield ChatModel_1.Chat.find({ participants: userId })
            .sort({ updatedAt: -1 }) // latest chats first
            .populate({
            path: "participants",
            select: "_id name avatarUrl",
        });
        // Add latest message to each chat
        const chatDataWithLastMessages = yield Promise.all(chats.map((chat) => __awaiter(void 0, void 0, void 0, function* () {
            const lastMessage = yield Message_1.Message.findOne({ chat: chat._id })
                .sort({ createdAt: -1 })
                .limit(1);
            return {
                _id: chat._id,
                partner: chat.participants[0]._id.toString() === userId
                    ? chat.participants[1]
                    : chat.participants[0],
                lastMessage,
            };
        })));
        return res.status(200).json(chatDataWithLastMessages);
    }
    catch (err) {
        console.error("Error fetching chats:", err);
        return res.status(500).json({ message: "Failed to fetch user chat" });
    }
});
exports.getUserChats = getUserChats;
exports.default = { getUserChats: exports.getUserChats };
