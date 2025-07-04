import mongoose, { Schema, Document } from "mongoose";

interface IGroup extends Document {
  name: string;
  description?: string;
  university?: string;
  admin: mongoose.Types.ObjectId;
  members: mongoose.Types.ObjectId[];
  coverImage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const GroupSchema: Schema<IGroup> = new Schema(
  {
    name: {
      type: String,
      required: [true, "Group name is required"],
      trim: true,
      minlength: [3, "Group name must be at least 3 characters"],
      maxlength: [100, "Group name cannot exceed 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    university: {
      type: String,
      trim: true,
      maxlength: [100, "University name cannot exceed 100 characters"],
    },
    admin: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Group admin is required"],
    },
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    coverImage: {
      type: String,
      trim: true,
      default: null,
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

const GroupModel =
  (mongoose.models.Group as mongoose.Model<IGroup>) ||
  mongoose.model<IGroup>("Group", GroupSchema);

export default GroupModel;