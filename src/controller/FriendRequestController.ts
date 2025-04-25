import { Request, Response } from "express";
import { IFriendRequest, FriendRequest } from "../model/FriendRequest";
import { IUser, User } from "../model/User";
import { isValidObjectId } from "mongoose";
import { Chat } from "../model/Chat";

const sendFriendRequest = async (req: Request, res: Response) => {
  try {
    const senderId = req.userId;
    const { receiverId } = req.body;

    if (!senderId || !receiverId) {
      return res
        .status(400)
        .json({ message: "Current user or receiverId not provided" });
    }

    if (!isValidObjectId(receiverId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const existingRequest = await FriendRequest.findOne({
      sender: senderId,
      receiver: receiverId,
    });

    if (existingRequest) {
      return res.status(400).json({ message: "Friend request already sent." });
    }

    const existingRequestReverse = await FriendRequest.findOne({
      sender: receiverId,
      receiver: senderId,
    });

    if (existingRequestReverse) {
      return res.status(400).json({
        message: "Friend request already sent from the other user.",
      });
    }

    const isAlreadyFriend = await User.findOne({
      _id: senderId,
      friends: receiverId,
    });

    if (isAlreadyFriend) {
      return res.status(400).json({ message: "Already friends." });
    }

    const friendRequest: IFriendRequest = new FriendRequest({
      sender: senderId,
      receiver: receiverId,
    });
    await friendRequest.save();

    const io = req.app.get("io");
    io.to(receiverId).emit(
      "friendRequest:received",
      await friendRequest.populate("sender", "name avatarUrl")
    );

    return res.status(201).json({ message: "Friend request sent" });
  } catch (error) {
    console.error("Error sending friend request:", error);
    return res.status(500).json({ message: "Failed to send friend request" });
  }
};

export const getSentFriendRequests = async (req: Request, res: Response) => {
  try {
    const senderId = req.userId;
    if (!senderId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const sentRequests = await FriendRequest.find({
      sender: senderId,
    }).populate("receiver", "name avatarUrl");

    return res.status(200).json(sentRequests);
  } catch (error) {
    console.error("Error retrieving sent friend requests:", error);
    return res
      .status(500)
      .json({ message: "Failed to retriev sent friend requests" });
  }
};

export const getReceivedFriendRequests = async (
  req: Request,
  res: Response
) => {
  try {
    const senderId = req.userId;
    if (!senderId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const receivedRequests = await FriendRequest.find({
      receiver: senderId,
    }).populate("sender", "name avatarUrl");

    return res.status(200).json(receivedRequests);
  } catch (error) {
    console.error("Error retrieving received friend requests:", error);
    return res
      .status(500)
      .json({ message: "Failed to retriev received friend requests" });
  }
};

export const cancelFriendRequest = async (req: Request, res: Response) => {
  try {
    const senderId = req.userId;
    const { requestId } = req.params;

    if (!senderId || !requestId) {
      return res.status(400).json({ message: "Invalid request" });
    }

    if (!isValidObjectId(requestId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const friendRequest = await FriendRequest.findOneAndDelete({
      _id: requestId,
      $or: [{ sender: senderId }, { receiver: senderId }],
    });

    if (!friendRequest) {
      return res
        .status(404)
        .json({ message: "Friend request not found or already processed." });
    }

    return res.status(200).json({ message: "Friend request canceled." });
  } catch (error) {
    console.error("Error canceling friend request:", error);
    return res.status(500).json({ message: "Failed to cancel friend request" });
  }
};

export const acceptFriendRequest = async (req: Request, res: Response) => {
  const { requestId } = req.params;
  const currentUserId = req.userId;

  try {
    if (!currentUserId || !requestId) {
      return res.status(400).json({ message: "Invalid request" });
    }

    if (!isValidObjectId(requestId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const friendRequest = await FriendRequest.findById(requestId);

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

    await User.findByIdAndUpdate(currentUserId, {
      $addToSet: { friends: friendRequest.sender },
    });

    await User.findByIdAndUpdate(friendRequest.sender, {
      $addToSet: { friends: friendRequest.receiver },
    });

    let chat = await Chat.findOne({
      participants: { $all: [friendRequest.sender, friendRequest.receiver] },
    });

    if (!chat) {
      chat = new Chat({
        participants: [friendRequest.sender, friendRequest.receiver],
      });
      await chat.save();
    }

    const currentUser = await User.findById<IUser>(currentUserId)
      .select("name avatarUrl")
      .lean();

    const friendRequestSender = await User.findById<IUser>(friendRequest.sender)
      .select("name avatarUrl")
      .lean();

    const io = req.app.get("io");
    io.to(friendRequest.sender.toString()).emit("friendRequest:accepted", {
      _id: chat._id,
      partner: {
        _id: currentUserId,
        name: currentUser?.name,
        avatarUrl: currentUser?.avatarUrl,
      },
      acceptBy: currentUserId,
    });

    io.to(currentUserId).emit("friendRequest:accepted", {
      _id: chat._id,
      partner: {
        _id: friendRequest.sender,
        name: friendRequestSender?.name,
        avatarUrl: friendRequestSender?.avatarUrl,
      },
      acceptBy: currentUserId,
    });

    await friendRequest.deleteOne();
    return res.status(200).json({ message: "Friend request accepted" });
  } catch (error) {
    console.error("Accept friend error:", error);
    return res
      .status(500)
      .json({ message: "Failed to accept the friend request" });
  }
};

export default {
  sendFriendRequest,
  getSentFriendRequests,
  getReceivedFriendRequests,
  cancelFriendRequest,
  acceptFriendRequest,
};
