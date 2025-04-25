import { Request, Response } from "express";
import { User } from "../model/User";

const getUserById = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json(user.toJSON());
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch user" });
  }
};

const getAllUsers = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const users = await User.find({ _id: { $ne: userId } }).select(
      "_id avatarUrl name"
    );
    return res.status(200).json(users);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch users" });
  }
};

export default {
  getAllUsers,
  getUserById,
};
