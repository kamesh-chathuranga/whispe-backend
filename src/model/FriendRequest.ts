import mongoose, { Schema, Document } from "mongoose";

export interface IFriendRequest extends Document {
  sender: mongoose.Types.ObjectId;
  receiver: mongoose.Types.ObjectId;
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
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const FriendRequest =
  mongoose.models.FriendRequest ??
  mongoose.model<IFriendRequest>("FriendRequest", friendRequestSchema);
