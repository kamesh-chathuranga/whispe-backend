import mongoose, { Schema, Document, Types } from "mongoose";

export interface IChat extends Document {
  participants: Types.ObjectId[];
  lastMessage?: Types.ObjectId;
}

const chatSchema = new Schema<IChat>(
  {
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: "Message",
    },
  },
  { timestamps: true }
);

export const Chat =
  mongoose.models.Chat ?? mongoose.model<IChat>("Chat", chatSchema);
