import { Request, Response } from "express";
import User from "../model/UserModel";

const getAllUsers = async (req: Request, res: Response) => {
  try {
    // Assume req.user is set by auth middleware
    const currentUserId = req.userId;
    if (!currentUserId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Find all users except the current user.
    const users = await User.find({ _id: { $ne: currentUserId } });
    return res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return res
      .status(500)
      .json({ message: "Server error while fetching users" });
  }
};

export default {
  getAllUsers,
};
