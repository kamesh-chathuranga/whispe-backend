// import { Request, Response } from "express";
// import User from "../model/user";
// import crypto from "crypto";
// import sendResetPasswordEmail, { EmailData } from "./EmailController";
// import mongoose from "mongoose";
// import Product from "../model/product";

// const getCurrentUser = async (req: Request, res: Response) => {
//   try {
//     const userId = req.userId;
//     const user = await User.findById(userId);

//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }
//     res.status(200).json(user);
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ message: "Failed to get user" });
//   }
// };

// const deleteCurrentUser = async (req: Request, res: Response) => {
//   try {
//     const userId = req.userId;
//     const deletedUser = await User.findByIdAndDelete(userId);

//     if (!deletedUser) {
//       return res.status(404).json({ message: "User not found" });
//     }
//     res.sendStatus(204);
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ message: "Failed to delete user" });
//   }
// };

// const updateCurrentUser = async (req: Request, res: Response) => {
//   try {
//     const userId = req.userId;
//     const { firstName, lastName, email, mobile } = req.body;
//     const user = await User.findByIdAndUpdate(
//       userId,
//       { firstName, lastName, email, mobile },
//       { new: true }
//     );

//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }
//     res.status(200).json(user);
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ message: "Failed to update user" });
//   }
// };

// const updateUserPassword = async (req: Request, res: Response) => {
//   try {
//     const userId = req.userId;
//     const { currentPassword, newPassword } = req.body;
//     const user = await User.findById(userId);

//     if (!user) {
//       return res.status(401).json({ message: "Access denied" });
//     }
//     const isMatch = await user.isPasswordMatch(currentPassword);

//     if (!isMatch) {
//       return res.status(401).json({ message: "Incorrect Password" });
//     }
//     user.password = newPassword;
//     await user.save();

//     res.status(200).json({ message: "Password updated successfully" });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ message: "Failed to update password" });
//   }
// };

// const forgotPassword = async (req: Request, res: Response) => {
//   try {
//     const { email } = req.body;
//     const user = await User.findOne({ email });

//     if (!user) {
//       return res.status(401).json({ message: "Incorrect email" });
//     }
//     const token = await user.generatePasswordResetToken();
//     await user.save();
//     const resetLink = `${process.env.SERVER_BASE_URL}/api/user/reset-password/${token}`;

//     const data: EmailData = {
//       to: user.email,
//       subject: "Password Reset",
//       text: "RESET PASSWORD",
//       html: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
//               Please click on the following link, or paste this into your browser to complete the process:\n\n
//               ${resetLink}\n\n
//               If you did not request this, please ignore this email and your password will remain unchanged.\n`,
//     };

//     await sendResetPasswordEmail(data);
//     res.status(200).json({ resetToke: token });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ message: "Failed to reset password" });
//   }
// };

// const resetPassword = async (req: Request, res: Response) => {
//   try {
//     const { newPassword } = req.body;
//     const { token } = req.params;

//     if (!token) {
//       return res.json(401).json({ message: "Failed to reset password" });
//     }
//     const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
//     const user = await User.findOne({
//       resetPasswordToken: hashedToken,
//       resetPasswordExpires: { $gt: Date.now() },
//     });

//     if (!user) {
//       return res.status(401).json({ message: "Invalid or expired token" });
//     }
//     user.password = newPassword;
//     user.resetPasswordToken = undefined;
//     user.resetPasswordExpires = undefined;
//     await user.save();

//     res.status(200).json({ message: "Password reset successfully" });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ message: "Failed to reset password" });
//   }
// };

// const addToWhishlist = async (req: Request, res: Response) => {
//   const userId = req.userId;
//   const { productId } = req.body;
//   const user = await User.findById(userId);

//   if (!user) {
//     return res.status(401).json({ message: "Unauthorized" });
//   }
//   const isValidId = mongoose.isValidObjectId(productId);

//   if (!isValidId) {
//     return res.status(400).json({ message: "Invalid product id" });
//   }
//   const existingProduct = user.whishList.find(
//     (id) => id.toString() === productId
//   );
//   let updatedUser;

//   if (existingProduct) {
//     updatedUser = await User.findByIdAndUpdate(
//       userId,
//       {
//         $pull: { whishList: productId },
//       },
//       { new: true }
//     );
//   } else {
//     updatedUser = await User.findByIdAndUpdate(
//       userId,
//       {
//         $push: { whishList: productId },
//       },
//       { new: true }
//     );
//   }
//   res.status(200).json(updatedUser);
// };

// export default {
//   getCurrentUser,
//   deleteCurrentUser,
//   updateCurrentUser,
//   updateUserPassword,
//   forgotPassword,
//   resetPassword,
//   addToWhishlist,
// };
