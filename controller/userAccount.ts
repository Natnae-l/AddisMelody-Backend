import { Request, Response } from "express";
import UserModel, { User } from "../model/user";
import bcrypt from "bcryptjs";
import fs, { truncateSync } from "fs";
import path from "path";
import { sendNotification } from "./notification";

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

    if (username.length > 20) {
      res.status(400).send({ message: "input value too long" });
    }
    if (password.length > 20) {
      res.status(400).send({ message: "input value too long" });
    }

    password = await bcrypt.hash(password, 8);

    const alreadyExist = await UserModel.findOne({ username: username });

    if (alreadyExist) {
      res.status(409).send({ message: "Account already exist" });
      return;
    }

    const newUser = new UserModel({ username, password });

    const savedUser = await newUser.save();

    sendNotification({
      to: savedUser._id as string,
      title: "Welcome to AddisMelody",
      body: "explore and add musics you like!",
      time: Date.now(),
      read: false,
    });

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

    const generatedToken = await account.generateToken();

    let token = generatedToken.token;
    let refreshToken = generatedToken.refreshToken;

    res.cookie("token", token, {
      secure: true,
      httpOnly: true,
      sameSite: "none",
    });
    res.cookie("token-strict", token, {
      secure: true,
      httpOnly: true,
      sameSite: "strict",
    });
    res.cookie("refreshToken", refreshToken, {
      secure: true,
      httpOnly: true,
      sameSite: "none",
    });

    res.status(200).json({
      message: "Login successful",
      userId: account._id,
      token: token,
      refreshToken: refreshToken,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      error: "Please try again later",
    });
  }
};

const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log(req.body);

    const updateAllowed: Array<keyof ToBeUpdated> = [
      "username",
      "profilePicture",
    ];
    const body: ToBeUpdated = req.body;

    if (req.file) {
      body["profilePicture"] =
        process.env.SERVER_URL +
        "/account/profile/uploads/" +
        req.file.filename;
    }

    let toBeUpdated: ToBeUpdated = {};

    for (let update in body) {
      if (updateAllowed.includes(update as keyof ToBeUpdated)) {
        toBeUpdated[update as keyof ToBeUpdated] =
          body[update as keyof ToBeUpdated];
        if (toBeUpdated[update as keyof ToBeUpdated]) {
          res.status(400).send({ message: "input value too long" });
          return;
        }
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

    if (updateAccount["profilePicture"] != "") {
      const serverUrl = process.env.SERVER_URL as string;

      const imageName = updateAccount["profilePicture"].substring(
        // 24 is the length of the url, we are going to parse
        serverUrl.length + 24
      );

      fs.unlink(path.join(__dirname, `../uploads/${imageName}`), (err) => {
        if (err) {
          console.error("Error deleting old profile image:", err);
        }
      });
    }

    for (let update in toBeUpdated) {
      updateAccount[update as keyof ToBeUpdated] =
        toBeUpdated[update as keyof ToBeUpdated] ||
        updateAccount[update as keyof ToBeUpdated] ||
        "";
    }

    const updated = await updateAccount.save();
    console.log(updated);

    res.status(200).send({
      message: "profile updated successfully",
      token: req.query.token,
      refreshToken: req.query.refreshToken,
      data: {
        username: updated.username,
        profilePicture: updated.profilePicture,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "error updating profile, please try again",
      token: req.query.token,
      refreshToken: req.query.refreshToken,
    });
  }
};

const getProfilePicture = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const imageName = req.params.image;
    console.log(imageName);
    if (!imageName) {
      res.status(404).send({ message: "profile picture unavailable" });
    }
    res.status(200).sendFile(path.join(__dirname, `../uploads/${imageName}`));
  } catch (error) {
    console.log(error);

    res.status(404).send({ message: "invalid request" });
  }
};

export { createAccount, login, updateProfile, getProfilePicture };
