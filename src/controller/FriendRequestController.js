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
exports.acceptFriendRequest = exports.cancelFriendRequest = exports.getReceivedFriendRequests = exports.getSentFriendRequests = void 0;
const FriendRequest_1 = require("../model/FriendRequest");
const UserModel_1 = require("../model/UserModel");
const mongoose_1 = require("mongoose");
const ChatModel_1 = require("../model/ChatModel");
const sendFriendRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const senderId = req.userId;
        const { receiverId } = req.body;
        if (!senderId || !receiverId) {
            return res
                .status(400)
                .json({ message: "Current user or receiverId not provided" });
        }
        if (!(0, mongoose_1.isValidObjectId)(receiverId)) {
            return res.status(400).json({ message: "Invalid user ID" });
        }
        const existingRequest = yield FriendRequest_1.FriendRequest.findOne({
            sender: senderId,
            receiver: receiverId,
        });
        if (existingRequest) {
            return res.status(400).json({ message: "Friend request already sent." });
        }
        const existingRequestReverse = yield FriendRequest_1.FriendRequest.findOne({
            sender: receiverId,
            receiver: senderId,
        });
        if (existingRequestReverse) {
            return res.status(400).json({
                message: "Friend request already sent from the other user.",
            });
        }
        const isAlreadyFriend = yield UserModel_1.User.findOne({
            _id: senderId,
            friends: receiverId,
        });
        if (isAlreadyFriend) {
            return res.status(400).json({ message: "Already friends." });
        }
        const friendRequest = new FriendRequest_1.FriendRequest({
            sender: senderId,
            receiver: receiverId,
        });
        yield friendRequest.save();
        const io = req.app.get("io");
        io.to(receiverId).emit("friendRequest:received", yield friendRequest.populate("sender", "name avatarUrl"));
        return res.status(201).json({ message: "Friend request sent" });
    }
    catch (error) {
        console.error("Error sending friend request:", error);
        return res.status(500).json({ message: "Failed to send friend request" });
    }
});
const getSentFriendRequests = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const senderId = req.userId;
        if (!senderId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const sentRequests = yield FriendRequest_1.FriendRequest.find({
            sender: senderId,
        }).populate("receiver", "name avatarUrl");
        return res.status(200).json(sentRequests);
    }
    catch (error) {
        console.error("Error retrieving sent friend requests:", error);
        return res
            .status(500)
            .json({ message: "Failed to retriev sent friend requests" });
    }
});
exports.getSentFriendRequests = getSentFriendRequests;
const getReceivedFriendRequests = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const senderId = req.userId;
        if (!senderId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const receivedRequests = yield FriendRequest_1.FriendRequest.find({
            receiver: senderId,
        }).populate("sender", "name avatarUrl");
        return res.status(200).json(receivedRequests);
    }
    catch (error) {
        console.error("Error retrieving received friend requests:", error);
        return res
            .status(500)
            .json({ message: "Failed to retriev received friend requests" });
    }
});
exports.getReceivedFriendRequests = getReceivedFriendRequests;
const cancelFriendRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const senderId = req.userId;
        const { requestId } = req.params;
        if (!senderId || !requestId) {
            return res.status(400).json({ message: "Invalid request" });
        }
        if (!(0, mongoose_1.isValidObjectId)(requestId)) {
            return res.status(400).json({ message: "Invalid user ID" });
        }
        const friendRequest = yield FriendRequest_1.FriendRequest.findOneAndDelete({
            _id: requestId,
            $or: [{ sender: senderId }, { receiver: senderId }],
        });
        if (!friendRequest) {
            return res
                .status(404)
                .json({ message: "Friend request not found or already processed." });
        }
        return res.status(200).json({ message: "Friend request canceled." });
    }
    catch (error) {
        console.error("Error canceling friend request:", error);
        return res.status(500).json({ message: "Failed to cancel friend request" });
    }
});
exports.cancelFriendRequest = cancelFriendRequest;
const acceptFriendRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { requestId } = req.params;
    const currentUserId = req.userId;
    try {
        if (!currentUserId || !requestId) {
            return res.status(400).json({ message: "Invalid request" });
        }
        if (!(0, mongoose_1.isValidObjectId)(requestId)) {
            return res.status(400).json({ message: "Invalid user ID" });
        }
        const friendRequest = yield FriendRequest_1.FriendRequest.findById(requestId);
        if (!friendRequest) {
            return res
                .status(404)
                .json({ message: "Friend request not found or already handled" });
        }
        if (friendRequest.receiver.toString() !== currentUserId) {
            return res
                .status(403)
                .json({ message: "Not authorized to accept this request" });
        }
        yield UserModel_1.User.findByIdAndUpdate(currentUserId, {
            $addToSet: { friends: friendRequest.sender },
        });
        yield UserModel_1.User.findByIdAndUpdate(friendRequest.sender, {
            $addToSet: { friends: friendRequest.receiver },
        });
        let chat = yield ChatModel_1.Chat.findOne({
            participants: { $all: [friendRequest.sender, friendRequest.receiver] },
        });
        if (!chat) {
            chat = new ChatModel_1.Chat({
                participants: [friendRequest.sender, friendRequest.receiver],
            });
            yield chat.save();
        }
        const currentUser = yield UserModel_1.User.findById(currentUserId)
            .select("name avatarUrl")
            .lean();
        const friendRequestSender = yield UserModel_1.User.findById(friendRequest.sender)
            .select("name avatarUrl")
            .lean();
        const io = req.app.get("io");
        io.to(friendRequest.sender.toString()).emit("friendRequest:accepted", {
            _id: chat._id,
            partner: {
                _id: currentUserId,
                name: currentUser === null || currentUser === void 0 ? void 0 : currentUser.name,
                avatarUrl: currentUser === null || currentUser === void 0 ? void 0 : currentUser.avatarUrl,
            },
            acceptBy: currentUserId,
        });
        io.to(currentUserId).emit("friendRequest:accepted", {
            _id: chat._id,
            partner: {
                _id: friendRequest.sender,
                name: friendRequestSender === null || friendRequestSender === void 0 ? void 0 : friendRequestSender.name,
                avatarUrl: friendRequestSender === null || friendRequestSender === void 0 ? void 0 : friendRequestSender.avatarUrl,
            },
            acceptBy: currentUserId,
        });
        yield friendRequest.deleteOne();
        return res.status(200).json({ message: "Friend request accepted" });
    }
    catch (error) {
        console.error("Accept friend error:", error);
        return res
            .status(500)
            .json({ message: "Failed to accept the friend request" });
    }
});
exports.acceptFriendRequest = acceptFriendRequest;
exports.default = {
    sendFriendRequest,
    getSentFriendRequests: exports.getSentFriendRequests,
    getReceivedFriendRequests: exports.getReceivedFriendRequests,
    cancelFriendRequest: exports.cancelFriendRequest,
    acceptFriendRequest: exports.acceptFriendRequest,
};
