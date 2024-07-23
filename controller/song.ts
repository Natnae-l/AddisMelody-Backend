import { Request, Response } from "express";
import SongModel from "../model/song";
import path from "path";
import mongoose from "mongoose";

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
    const page = parseInt(req.query.page as string) || 1;
    const limit = 6;

    let filterDb;

    const genres = [
      "Pop",
      "Hip-Hop/Rap",
      "Rock",
      "Electronic Dance Music (EDM)",
      "R&B (Rhythm and Blues)",
    ];

    if (req.query.genre && genres.includes(req.query.genre as string)) {
      filterDb = { createdBy: req.query._id, genre: req.query.genre };
    } else {
      filterDb = { createdBy: req.query._id };
    }

    const skip = (page - 1) * limit;

    const mySongs = await SongModel.find(filterDb, { createdBy: 0 })
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limit);

    const count = await SongModel.countDocuments(filterDb);

    res.status(200).send({ songs: mySongs, count: count });
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
      if (files["audio"]) {
        console.log("hi");

        newSong["audio"] =
          process.env.SERVER_URL + "/songs/data/" + files["audio"][0].filename;
      }
      if (files["banner"]) {
        newSong["banner"] =
          process.env.SERVER_URL + "/songs/data/" + files["banner"][0].filename;
      }
    }

    newSong = await newSong.save();

    res.status(201).send({
      message: "song added successfully",
      data: { ...newSong.toJSON(), createdBy: undefined },
    });
  } catch (error) {
    console.log(error);

    res.status(400).send({ message: "Invalid input" });
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

    const toBeUpdated: ToBeUpdated = {};

    for (let prop in body) {
      if (updates.includes(prop as keyof ToBeUpdated)) {
        toBeUpdated[prop as keyof ToBeUpdated] =
          body[prop as keyof ToBeUpdated];
      }
    }

    const files = req.files ? (req.files as UploadedFiles) : null;

    if (files) {
      if (files["audio"]) {
        toBeUpdated["audio"] =
          process.env.SERVER_URL + "/songs/data/" + files["audio"][0].filename;
      }
      if (files["banner"]) {
        toBeUpdated["banner"] =
          process.env.SERVER_URL + "/songs/data/" + files["banner"][0].filename;
      }
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

const generateStatistics = async (req: Request, res: Response) => {
  try {
    const createdBy = req.query._id as string;
    if (!createdBy) {
      return res.status(400).json({ message: "Invalid request" });
    }

    // Aggregation pipeline
    const aggregationPipeline = [
      { $match: { createdBy: new mongoose.Types.ObjectId(createdBy) } },
      {
        $facet: {
          totalSongs: [{ $count: "count" }],
          totalArtists: [{ $group: { _id: "$artist" } }, { $count: "count" }],
          totalAlbums: [{ $group: { _id: "$album" } }, { $count: "count" }],
          totalGenres: [{ $group: { _id: "$genre" } }, { $count: "count" }],
          genreCounts: [{ $group: { _id: "$genre", count: { $sum: 1 } } }],
          artistAlbumCounts: [
            {
              $group: {
                _id: { artist: "$artist", album: "$album" },
                count: { $sum: 1 },
              },
            },
          ],
          albumSongCounts: [{ $group: { _id: "$album", count: { $sum: 1 } } }],
          genreSongCounts: [{ $group: { _id: "$genre", count: { $sum: 1 } } }],
          artistSongCounts: [
            { $group: { _id: "$artist", count: { $sum: 1 } } },
          ],
          favoriteSongsCount: [
            { $match: { favourite: true } },
            { $count: "count" },
          ],
        },
      },
    ];

    // Run the aggregation pipeline
    const results = await SongModel.aggregate(aggregationPipeline);

    // Check if results are empty
    if (results.length === 0) {
      return res.status(200).json({ message: "No statistics found" });
    }

    const statistics = results[0];

    // Construct the response
    res.status(200).json({
      totalSongs: statistics.totalSongs?.[0]?.count || 0,
      totalArtists: statistics.totalArtists?.[0]?.count || 0,
      totalAlbums: statistics.totalAlbums?.[0]?.count || 0,
      totalGenres: statistics.totalGenres?.[0]?.count || 0,
      genreCounts: statistics.genreCounts || [],
      artistAlbumCounts: statistics.artistAlbumCounts || [],
      albumSongCounts: statistics.albumSongCounts || [],
      genreSongCounts: statistics.genreSongCounts || [],
      artistSongCounts: statistics.artistSongCounts || [],
      favoriteSongsCount: statistics.favoriteSongsCount?.[0]?.count || 0,
    });
  } catch (error: any) {
    console.error("Error generating statistics:", error);
    res.status(500).json({ message: "Error getting statistics" });
  }
};

const toggleFavourite = async (req: Request, res: Response) => {
  try {
    const _id = req.params.id;

    let song = await SongModel.findOne({ createdBy: req.query._id, _id });

    if (!song) {
      res.status(404).send({ message: "Song not found" });
      return;
    }

    if (song) {
      song.favourite = song.favourite ? !song.favourite : true;
    }

    song = await song.save();
    res.status(200).send({ data: song.toJSON() });
  } catch (error) {
    res.status(500).send({ message: "error toggling favourite" });
  }
};

export {
  getSongs,
  saveSongs,
  getFile,
  deleteSongs,
  updateSong,
  generateStatistics,
  toggleFavourite,
};
