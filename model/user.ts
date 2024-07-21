import mongoose, { Document, Schema } from "mongoose";
import jwt from "jsonwebtoken";

interface Tokens {
  token: string;
  refreshToken: string;
}

export interface User extends Document {
  username: string;
  password: string;
  profilePicture: string;
  generateToken(): Promise<Tokens>;
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
  token: {
    type: String,
    required: false,
  },
  refreshToken: {
    type: String,
    required: false,
  },
});

userSchema.methods.generateToken = async function (): Promise<Tokens> {
  const token: string = jwt.sign(
    { _id: this._id },
    process.env.JWT_SECRET as string,
    {
      expiresIn: 60,
    }
  );
  const refreshToken: string = jwt.sign(
    { _id: this._id },
    process.env.JWT_SECRET as string,
    { expiresIn: 60 * 60 }
  );
  this.token = token;
  this.refreshToken = refreshToken;
  await this.save();
  return { token, refreshToken };
};

export default mongoose.model<User>("users", userSchema);
