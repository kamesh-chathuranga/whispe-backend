import mongoose, { Schema, Document } from "mongoose";

export type FriendRequestStatus = "pending" | "accepted" | "rejected";

export interface IFriendRequest extends Document {
  sender: mongoose.Types.ObjectId;
  receiver: mongoose.Types.ObjectId;
  status: FriendRequestStatus;
  createdAt: Date;
}

const friendRequestSchema = new Schema<IFriendRequest>(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const FriendRequest =
  mongoose.models.FriendRequest ??
  mongoose.model<IFriendRequest>("FriendRequest", friendRequestSchema);
