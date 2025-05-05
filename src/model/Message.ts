import mongoose, { Schema, Document, Types } from "mongoose";

export type AttachmentType = "image" | "audio" | "video" | "file";

export interface IAttachment {
  url: string;
  type: AttachmentType;
  filename: string;
  size: number;
  mimeType: string;
  duration?: number;
}

export interface IMessage extends Document {
  sender: Types.ObjectId;
  chat: Types.ObjectId;
  content: string;
  attachments?: IAttachment[];
  seenBy: Types.ObjectId;
  status: "sent" | "delivered" | "read";
  createdAt: Date;
  updatedAt: Date;
}

const AttachmentSchema = new Schema<IAttachment>(
  {
    url: { type: String, required: true },
    type: {
      type: String,
      required: true,
      enum: ["image", "audio", "video", "file"],
    },
    filename: { type: String, required: true },
    size: { type: Number, required: true },
    mimeType: { type: String, required: true },
    duration: { type: Number },
  },
  { _id: false }
);

const MessageSchema = new Schema<IMessage>(
  {
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    chat: { type: Schema.Types.ObjectId, ref: "Chat", required: true },
    content: { type: String, required: true },
    attachments: { type: [AttachmentSchema], default: [] },
    seenBy: { type: Schema.Types.ObjectId, ref: "User" },
    status: {
      type: String,
      enum: ["sent", "delivered", "read"],
      default: "sent",
    },
  },
  { timestamps: true }
);

export const Message =
  mongoose.models.Message ?? mongoose.model<IMessage>("Message", MessageSchema);
