import { Request, Response } from "express";
import UserModel, { User } from "../model/user";

const createAccount = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password }: User = req.body;

    const alreadyExist = await UserModel.findOne({ username: username });

    if (alreadyExist) {
      res.status(403).send({ message: "Account already exist" });
      return;
    }

    const newUser = new UserModel({ username, password });

    await newUser.save();

    res.status(201).send({ message: "Account created successfully" });
  } catch (error) {}
};
