import { Schema, Document, model } from "mongoose";

interface Song extends Document {
  createdBy: string;
  title: string;
  artist: string;
  album: string;
  genre: string;
  banner: string;
  audio: string;
  favourite: boolean;
  private: boolean;
}

const songSchema = new Schema(
  {
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
      enum: [
        "Pop",
        "Hip-Hop/Rap",
        "Rock",
        "Electronic Dance Music (EDM)",
        "R&B (Rhythm and Blues)",
      ],
    },
    private: {
      type: Boolean,
      required: true,
    },
    banner: {
      type: String,
    },
    audio: {
      type: String,
    },
    favourite: {
      type: Boolean,
      default: false,
    },
    favouritedBy: [
      {
        type: Schema.Types.ObjectId,
        ref: "users",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const userModel = model<Song>("songs", songSchema);
export default userModel;
