import { Request, Response } from "express";
import mongoose from "mongoose";
import { IFriendRequest, FriendRequest } from "../model/FriendRequest";
import { User } from "../model/UserModel";
import { createOneToOneChat } from "./ChatController";

/**
 * Send a friend request from current user to target user.
 */
const sendFriendRequest = async (req: Request, res: Response) => {
  try {
    const { receiverId, currentUserId } = req.body;

    if (!currentUserId || !receiverId) {
      return res
        .status(400)
        .json({ message: "Current user or receiverId not provided" });
    }

    // Check if a friend request already exists in pending state
    const existingRequest = await FriendRequest.findOne({
      sender: currentUserId,
      receiver: receiverId,
      status: "pending",
    });
    if (existingRequest) {
      return res.status(400).json({ message: "Friend request already sent." });
    }

    // Create a new friend request document
    const friendRequest: IFriendRequest = new FriendRequest({
      sender: currentUserId,
      receiver: receiverId,
    });
    await friendRequest.save();

    return res
      .status(201)
      .json({ message: "Friend request sent", friendRequest });
  } catch (error) {
    console.error("Error sending friend request:", error);
    return res
      .status(500)
      .json({ message: "Server error while sending friend request" });
  }
};

/**
 * Get friend requests sent by the current user.
 */
// export const getSentFriendRequests = async (req: Request, res: Response) => {
//   try {
//     const currentUserId = req.user?._id;
//     if (!currentUserId) {
//       return res.status(401).json({ message: "Unauthorized" });
//     }

//     const sentRequests = await FriendRequest.find({
//       sender: currentUserId,
//       status: "pending",
//     }).populate("receiver", "name email avatarUrl");

//     return res.status(200).json(sentRequests);
//   } catch (error) {
//     console.error("Error retrieving sent friend requests:", error);
//     return res
//       .status(500)
//       .json({ message: "Server error while retrieving sent friend requests" });
//   }
// };

// /**
//  * Get friend requests received by the current user.
//  */
// export const getReceivedFriendRequests = async (
//   req: Request,
//   res: Response
// ) => {
//   try {
//     const currentUserId = req.user?._id;
//     if (!currentUserId) {
//       return res.status(401).json({ message: "Unauthorized" });
//     }

//     const receivedRequests = await FriendRequest.find({
//       receiver: currentUserId,
//       status: "pending",
//     }).populate("sender", "name email avatarUrl");

//     return res.status(200).json(receivedRequests);
//   } catch (error) {
//     console.error("Error retrieving received friend requests:", error);
//     return res
//       .status(500)
//       .json({
//         message: "Server error while retrieving received friend requests",
//       });
//   }
// };

// /**
//  * Cancel a sent friend request.
//  */
// export const cancelFriendRequest = async (req: Request, res: Response) => {
//   try {
//     const currentUserId = req.user?._id;
//     const { requestId } = req.params;

//     if (!currentUserId || !mongoose.Types.ObjectId.isValid(requestId)) {
//       return res.status(400).json({ message: "Invalid request" });
//     }

//     // Only allow cancellation if the current user is the sender.
//     const friendRequest = await FriendRequest.findOneAndDelete({
//       _id: requestId,
//       sender: currentUserId,
//       status: "pending",
//     });

//     if (!friendRequest) {
//       return res
//         .status(404)
//         .json({ message: "Friend request not found or already processed." });
//     }

//     return res.status(200).json({ message: "Friend request canceled." });
//   } catch (error) {
//     console.error("Error canceling friend request:", error);
//     return res
//       .status(500)
//       .json({ message: "Server error while canceling friend request" });
//   }
// };

// /**
//  * Accept a received friend request.
//  * This function updates both users' friend lists, sets the friend request to 'accepted',
//  * and creates a one-to-one chat room between the two users.
//  */
// export const acceptFriendRequest = async (req: Request, res: Response) => {
//   try {
//     const currentUserId = req.user?._id;
//     const { requestId } = req.params;

//     if (!currentUserId || !mongoose.Types.ObjectId.isValid(requestId)) {
//       return res.status(400).json({ message: "Invalid request" });
//     }

//     // Find the friend request; ensure the current user is the receiver.
//     const friendRequest = await FriendRequest.findOne({
//       _id: requestId,
//       receiver: currentUserId,
//       status: "pending",
//     });

//     if (!friendRequest) {
//       return res
//         .status(404)
//         .json({ message: "Friend request not found or already processed." });
//     }

//     // Update the status to accepted.
//     friendRequest.status = "accepted";
//     await friendRequest.save();

//     // Update both users' friend lists
//     const { sender, receiver } = friendRequest;
//     await User.findByIdAndUpdate(sender, { $addToSet: { friends: receiver } });
//     await User.findByIdAndUpdate(receiver, { $addToSet: { friends: sender } });

//     // Create a one-to-one chat if it does not exist
//     const chat = await createOneToOneChat(sender, receiver);

//     return res.status(200).json({ message: "Friend request accepted", chat });
//   } catch (error) {
//     console.error("Error accepting friend request:", error);
//     return res
//       .status(500)
//       .json({ message: "Server error while accepting friend request" });
//   }
// };

export default { sendFriendRequest };
