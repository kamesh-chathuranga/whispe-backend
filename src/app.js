"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.httpServer = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const routers_1 = __importDefault(require("./routers"));
const validateToken_1 = require("./middleware/validateToken");
const mongoose_1 = __importStar(require("mongoose"));
const ChatModel_1 = require("./model/ChatModel");
const Message_1 = require("./model/Message");
const app = (0, express_1.default)();
exports.httpServer = (0, http_1.createServer)(app);
app.use((0, cors_1.default)({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, helmet_1.default)());
app.use((0, morgan_1.default)("dev"));
app.use("/api/v1", routers_1.default);
const io = new socket_io_1.Server(exports.httpServer, {
    cors: {
        origin: process.env.FRONTEND_URL,
        methods: ["GET", "POST"],
        credentials: true,
    },
});
// Socket.IO auth middleware
io.use((socket, next) => {
    try {
        const cookies = socket.request.headers.cookie;
        if (!cookies)
            throw new Error("No cookies");
        const parsed = Object.fromEntries(cookies.split("; ").map((c) => c.split("=")));
        const accessToken = parsed["accessToken"];
        if (!accessToken)
            throw new Error("No access token");
        const payload = (0, validateToken_1.verifyAccessToken)(accessToken);
        socket.data.userId = payload.userId;
        next();
    }
    catch (err) {
        next(new Error("Authentication error"));
    }
});
io.on("connection", (socket) => {
    const userId = socket.data.userId;
    console.log(`User connected: ${userId}`);
    // Join personal room for notifications
    socket.join(userId);
    // Handle joining a chat
    socket.on("joinChat", (chatId, ack) => __awaiter(void 0, void 0, void 0, function* () {
        if (!(0, mongoose_1.isValidObjectId)(chatId))
            return ack({ status: 400, error: "Invalid chatId" });
        const chat = yield ChatModel_1.Chat.findById(chatId);
        if (!chat)
            return ack({ status: 404, error: "Chat not found" });
        if (!chat.participants.includes(mongoose_1.default.Types.ObjectId.createFromHexString(userId)))
            return ack({ status: 403, error: "Not a participant" });
        socket.join(chatId);
        ack({ status: 200, data: "Joined chat" });
    }));
    // Handle sending message
    socket.on("message:send", (data, ack) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { chatId, content, attachments } = data;
            // Validate chat
            if (!(0, mongoose_1.isValidObjectId)(chatId))
                return ack({ status: 400, error: "Invalid chatId" });
            const chat = yield ChatModel_1.Chat.findById(chatId);
            if (!chat)
                return ack({ status: 404, error: "Chat not found" });
            if (!chat.participants.includes(mongoose_1.default.Types.ObjectId.createFromHexString(userId)))
                return ack({ status: 403, error: "Not a participant" });
            // Create message
            const message = yield Message_1.Message.create({
                sender: userId,
                chat: chatId,
                content,
                attachments,
            });
            const populatedMessage = yield message.populate({
                path: "sender",
                select: "name avatarUrl", // Include other fields if needed
            });
            // Update last message
            chat.lastMessage = message._id;
            yield chat.save();
            // Broadcast to room
            io.to(chatId).emit("message:new", populatedMessage);
            ack({ status: 201, data: message });
        }
        catch (err) {
            console.error("message:send error", err);
            ack({ status: 500, error: "Internal server error" });
        }
    }));
    // Fetch message history
    socket.on("message:history", (data, ack) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { chatId, before, limit } = data;
            if (!(0, mongoose_1.isValidObjectId)(chatId))
                return ack({ status: 400, error: "Invalid chatId" });
            const query = { chat: chatId };
            if (before)
                query.createdAt = { $lt: new Date(before) };
            const recentMessages = yield Message_1.Message.find(query)
                .populate({ path: "sender", select: "name avatarUrl" })
                .sort({ createdAt: -1 })
                .limit(limit || 20);
            // Return in ascending order
            ack({ status: 200, data: recentMessages.reverse() });
        }
        catch (err) {
            console.error(err);
            ack({ status: 500, error: "Server error" });
        }
    }));
    // Handle vedio calling
    socket.on("call", (data, ack) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { caller, receiver } = data;
            // Validate chat
            if (!(0, mongoose_1.isValidObjectId)(caller._id))
                return ack({ status: 400, error: "Invalid callerId" });
            // Broadcast to room
            io.to(receiver._id).emit("call:incoming", data);
            ack({ status: 200, data: data });
        }
        catch (err) {
            console.error("call error", err);
            ack({ status: 500, error: "Internal server error" });
        }
    }));
    socket.on("webrtcSignal", (data) => {
        const { incomingCall, isCaller } = data;
        if (isCaller) {
            if (incomingCall.receiver._id) {
                io.to(incomingCall.receiver._id).emit("webrtcSignal", data);
            }
        }
        else {
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
        }
        else {
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
exports.default = app;
