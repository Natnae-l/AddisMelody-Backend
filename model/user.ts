import mongoose, { Document, Schema } from "mongoose";

export interface User extends Document {
  username: string;
  password: string;
  profilePicture: string;
}

const userSchema = new Schema({
  username: {
    required: true,
    unique: true,
    type: String,
  },
  password: {
    required: true,
    type: String,
  },
  profilePicture: {
    required: false,
    type: String,
    default: "",
  },
});

export default mongoose.model<User>("users", userSchema);
