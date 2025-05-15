import mongoose, { Schema, Document, Types } from "mongoose";

export type AttachmentType = "image" | "audio" | "video" | "file";

export interface IAttachment {
  objectKey: string;
  type: AttachmentType;
  filename: string;
  size: number;
  mimeType: string;
  duration?: number;
}

export interface IMessage extends Document {
  sender: Types.ObjectId;
  chat: Types.ObjectId;
  content?: string;
  attachment?: IAttachment;
  seenBy: Types.ObjectId;
  status: "sent" | "delivered" | "read";
}

const AttachmentSchema = new Schema<IAttachment>(
  {
    objectKey: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["image", "audio", "video", "file"],
    },
    filename: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
    },
  },
  { _id: false }
);

const MessageSchema = new Schema<IMessage>(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    chat: {
      type: Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
    },
    content: {
      type: String,
      validate: {
        validator: function (this: IMessage, value?: string): boolean {
          if (this.attachment) {
            return true;
          }

          return typeof value === "string" && value.trim().length > 0;
        },
        message: "Content is required when there are no attachments.",
      },
    },
    attachment: {
      type: AttachmentSchema,
      default: undefined,
    },
    seenBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    status: {
      type: String,
      enum: ["sent", "delivered", "read"],
      default: "sent",
    },
  },
  { timestamps: true }
);
MessageSchema.index({ chat: 1, createdAt: -1 });

export const Message =
  mongoose.models.Message ?? mongoose.model<IMessage>("Message", MessageSchema);
