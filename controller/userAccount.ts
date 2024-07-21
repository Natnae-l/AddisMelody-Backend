import { Request, Response } from "express";
import UserModel, { User } from "../model/user";
import bcrypt from "bcryptjs";

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

export { createAccount, login };
