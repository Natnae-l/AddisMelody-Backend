import { Request, Response } from "express";
import UserModel, { User } from "../model/user";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";

interface ToBeUpdated {
  username?: string;
  password?: string;
  profilePicture?: string;
}

const createAccount = async (req: Request, res: Response): Promise<void> => {
  try {
    let { username, password }: User = req.body;

    if (!(username && password)) {
      res.status(400).send({ message: "Invalid input" });
      return;
    }

    password = await bcrypt.hash(password, 8);

    const alreadyExist = await UserModel.findOne({ username: username });

    if (alreadyExist) {
      res.status(409).send({ message: "Account already exist" });
      return;
    }

    const newUser = new UserModel({ username, password });

    await newUser.save();

    res.status(201).send({ message: "Account created successfully" });
  } catch (error) {
    res
      .status(500)
      .send({ message: "Error creating account, please try again" });
  }
};

const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      res.status(400).send({ error: "Invalid username or password" });
      return;
    }

    const account = await UserModel.findOne({
      username: username,
    });

    if (!account) {
      res.status(400).send({ error: "Invalid username or password" });
      return;
    }

    const isSimilar = await bcrypt.compare(password, account.password);

    if (!isSimilar) {
      res.status(400).send({ error: "Invalid username or password" });
      return;
    }

    // set an http-only cookie here, sameSite="strict"
    const generatedToken = await account.generateToken();

    res.cookie("token", generatedToken.token, {
      httpOnly: true,
      sameSite: "strict",
    });
    res.cookie("refreshToken", generatedToken.refreshToken, {
      httpOnly: true,
      sameSite: "strict",
    });
    res.status(200).json({ message: "Login successful" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "Please try again later" });
  }
};

const updateProfile = async (req: Request, res: Response): Promise<void> => {
  console.log(req.query._id);

  try {
    const updateAllowed: Array<keyof ToBeUpdated> = [
      "username",
      "profilePicture",
      "password",
    ];
    const body: ToBeUpdated = req.body;

    if (req.file) {
      req.body["profileImage"] =
        process.env.serverUrl + "/profile/uploads/" + req.file.filename;
    }

    let toBeUpdated: ToBeUpdated = {};

    for (let update in body) {
      if (updateAllowed.includes(update as keyof ToBeUpdated)) {
        toBeUpdated[update as keyof ToBeUpdated] =
          body[update as keyof ToBeUpdated];
      }
    }

    if (Object.keys(toBeUpdated).length == 0) {
      res.status(400).json({ message: "Required fields not supplied" });
      return;
    }

    const updateAccount: User | null = await UserModel.findOne({
      _id: req.query._id,
    });

    if (!updateAccount) {
      res.status(404).send({ message: "Account doesn't exist" });
      return;
    }
    //here
    if (updateAccount["profilePicture"] != "") {
      const serverUrl = process.env.SERVER_URL as string;

      const imageName = updateAccount["profilePicture"].substring(
        // 24 is the length of the url, we are going to parse
        serverUrl.length + 17
      );

      fs.unlink(path.join(__dirname, `../uploads/${imageName}`), (err) => {
        if (err) {
          console.error("Error deleting old profile image:", err);
        }
      });
    }
  } catch (error) {
    console.log(error);
  }
};

export { createAccount, login, updateProfile };
