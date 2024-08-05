import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import UserModel from "../model/user";

export interface Id {
  _id: string;
}
interface Tokens {
  token: string;
  refreshToken: string;
}

const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.token;
    const refreshToken = req.cookies.refreshToken;

    if (token && refreshToken) {
      let auth;
      try {
        auth = jwt.verify(token, process.env.JWT_SECRET as string) as Id;
        if (auth) {
          req.query._id = auth._id;

          next();
        }
      } catch (error) {
        try {
          auth = jwt.verify(
            refreshToken,
            process.env.JWT_SECRET as string
          ) as Id;
          if (auth) {
            const user = await UserModel.findOne({
              _id: auth._id,
            });
            if (!user) {
              return res.status(401).json({ message: "not authorized" });
            }
            let generatedToken = await user.generateToken();

            res.cookie("token", token, {
              secure: true,
              httpOnly: true,
              sameSite: "none",
            });
            res.cookie("refreshToken", refreshToken, {
              secure: true,
              httpOnly: true,
              sameSite: "none",
            });

            req.query.token = generatedToken.token;
            req.query.refreshToken = generatedToken.refreshToken;
            req.query._id = auth._id;
            next();
          }
        } catch (error) {
          console.log(error);
          return res.status(401).json({ message: "not authorized" });
        }
      }
    } else {
      res.status(400).send({
        message: "not authorized",
      });
    }
  } catch (error) {
    console.log(error);

    res.status(500).send({ message: "Internal server error" });
  }
};

export default auth;
