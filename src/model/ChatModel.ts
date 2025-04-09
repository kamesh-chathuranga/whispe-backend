import mongoose, { Schema, Document, Types } from "mongoose";

export interface IChat extends Document {
  name?: string; // Only for group chats
  isGroupChat: boolean;
  users: Types.ObjectId[]; // Participants
  admin?: Types.ObjectId; // For group chat admin
  lastMessage?: Types.ObjectId;
}

const chatSchema = new Schema<IChat>(
  {
    name: { type: String },
    isGroupChat: { type: Boolean, default: false },
    users: [{ type: Schema.Types.ObjectId, ref: "User" }],
    admin: { type: Schema.Types.ObjectId, ref: "User" },
    lastMessage: { type: Schema.Types.ObjectId, ref: "Message" },
  },
  { timestamps: true }
);

export default mongoose.model<IChat>("Chat", chatSchema);
