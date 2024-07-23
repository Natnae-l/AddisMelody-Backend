import { Schema, Document, model } from "mongoose";

interface Notification extends Document {
  to: string;
  title: string;
  body: string;
  time: number;
  read: boolean;
}

const notificationSchema = new Schema(
  {
    to: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    title: {
      required: true,
      type: String,
    },
    body: {
      required: true,
      type: String,
    },
    time: {
      required: true,
      type: Number,
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const userModel = model<Notification>("notifications", notificationSchema);
export default userModel;
