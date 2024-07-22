import { Schema, Document, model } from "mongoose";

interface Song extends Document {
  createdBy: string;
  title: string;
  artist: string;
  album: string;
  genre: string;
  banner: string;
  audio: string;
}

const songSchema = new Schema({
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  title: {
    required: true,
    type: String,
  },
  artist: {
    required: true,
    type: String,
  },
  album: {
    required: true,
    type: String,
  },
  genre: {
    required: true,
    type: String,
  },
  banner: {
    type: String,
  },
  audio: {
    type: String,
  },
});

const userModel = model<Song>("songs", songSchema);
export default userModel;
