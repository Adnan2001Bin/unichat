import mongoose, { Schema, Document } from "mongoose";

interface IMessage extends Document {
  sender: mongoose.Types.ObjectId;
  content: string;
  chatType: "one-on-one" | "group";
  recipient?: mongoose.Types.ObjectId; // For one-on-one chats
  group?: mongoose.Types.ObjectId; // For group chats
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema: Schema<IMessage> = new Schema(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Sender is required"],
    },
    content: {
      type: String,
      required: [true, "Message content is required"],
      trim: true,
      maxlength: [2000, "Message cannot exceed 2000 characters"],
    },
    chatType: {
      type: String,
      enum: ["one-on-one", "group"],
      required: [true, "Chat type is required"],
    },
    recipient: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: function () {
        return this.chatType === "one-on-one";
      },
    },
    group: {
      type: Schema.Types.ObjectId,
      ref: "Group",
      required: function () {
        return this.chatType === "group";
      },
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const MessageModel =
  (mongoose.models.Message as mongoose.Model<IMessage>) ||
  mongoose.model<IMessage>("Message", MessageSchema);

export default MessageModel;
