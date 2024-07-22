import { Schema, Document, model } from "mongoose";

interface Song extends Document {
  title: string;
  artist: string;
  album: string;
  genre: string;
}

const songSchema = new Schema({
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
});

const userModel = model<Song>("songs", songSchema);
export default userModel;
