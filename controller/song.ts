import { Request, Response } from "express";
import SongModel from "../model/song";
import path from "path";

interface Song {
  createdBy: string;
  title: string;
  artist: string;
  album: string;
  genre: string;
  banner?: string;
  audio?: string;
}

interface ToBeUpdated {
  title?: string;
  artist?: string;
  album?: string;
  genre?: string;
  banner?: string;
  audio?: string;
}

interface UploadedFiles {
  [fieldname: string]: Express.Multer.File[];
}

const getSongs = async (req: Request, res: Response): Promise<void> => {
  try {
    const mySongs = await SongModel.find(
      { createdBy: req.query._id },
      { createdBy: 0 }
    );

    res.status(200).send({ songs: mySongs });
  } catch (error) {
    res.status(500).send({ message: "error fetching songs" });
  }
};

const saveSongs = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, artist, album, genre }: Song = req.body;

    if (!(title?.trim() && artist?.trim() && album?.trim() && genre?.trim())) {
      res.status(400).send({ message: "invalid input" });
      return;
    }

    let newSong = new SongModel({
      createdBy: req.query._id,
      title,
      artist,
      album,
      genre,
    });

    const files = req.files ? (req.files as UploadedFiles) : null;

    if (files) {
      newSong["audio"] =
        process.env.SERVER_URL + "/songs/data/" + files["audio"][0].filename;
      newSong["banner"] =
        process.env.SERVER_URL + "/songs/data/" + files["banner"][0].filename;
    }

    newSong = await newSong.save();

    res.status(201).send({
      message: "song added successfully",
      data: { ...newSong.toJSON(), createdBy: undefined },
    });
  } catch (error) {
    res.status(500).send({ message: "error saving song" });
  }
};

const getFile = async (req: Request, res: Response): Promise<void> => {
  try {
    const fileName = req.params.file;

    if (!fileName) {
      res.status(404).send({ message: "requested file unavailable" });
      return;
    }
    res.status(200).sendFile(path.join(__dirname, `../uploads/${fileName}`));
  } catch (error) {
    res.status(404).send({ message: "invalid request" });
  }
};

const updateSong = async (req: Request, res: Response) => {
  try {
    const body: Song = req.body;

    const updates: Array<keyof ToBeUpdated> = [
      "album",
      "artist",
      "genre",
      "title",
      "banner",
      "audio",
    ];
    console.log(body);

    const toBeUpdated: ToBeUpdated = {};

    for (let prop in body) {
      if (updates.includes(prop as keyof ToBeUpdated)) {
        toBeUpdated[prop as keyof ToBeUpdated] =
          body[prop as keyof ToBeUpdated];
      }
    }

    const files = req.files ? (req.files as UploadedFiles) : null;

    if (files) {
      toBeUpdated["audio"] =
        process.env.SERVER_URL + "/songs/data/" + files["audio"][0].filename;
      toBeUpdated["banner"] =
        process.env.SERVER_URL + "/songs/data/" + files["banner"][0].filename;
    }

    if (Object.keys(toBeUpdated).length == 0) {
      res.status(400).json({ message: "Required fields not supplied" });
      return;
    }

    let song = await SongModel.findOne({ _id: req.params.id });
    if (!song) {
      res.status(404).send({ message: "Song doesn't exist" });
      return;
    }

    for (let prop in toBeUpdated) {
      song[prop as keyof ToBeUpdated] =
        toBeUpdated[prop as keyof ToBeUpdated] ||
        song[prop as keyof ToBeUpdated] ||
        "";
    }

    song = await song.save();

    res.status(201).send({
      message: "song updated successfully",
      data: { ...song.toJSON(), createdBy: undefined },
    });
  } catch (error) {
    res.send({ message: "error updating account" });
  }
};

const deleteSongs = async (req: Request, res: Response): Promise<void> => {
  try {
    await SongModel.findOneAndDelete({
      createdBy: req.query._id,
      _id: req.params.id,
    });

    res.status(200).send({ message: "song deleted successfully" });
  } catch (error) {
    res.status(500).send({ message: "error deleting song" });
  }
};

export { getSongs, saveSongs, getFile, deleteSongs, updateSong };
