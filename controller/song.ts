import { Request, Response } from "express";
import SongModel from "../model/song";

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

const saveSongs = async (req: Request, res: Response): Promise<void> => {};

export { getSongs, saveSongs };
