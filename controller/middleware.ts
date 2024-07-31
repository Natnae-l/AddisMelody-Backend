import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import UserModel from "../model/user";

interface Id {
  _id: string;
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
              res.clearCookie("token");
              res.clearCookie("refreshToken");

              return res.status(401).json({ message: "not authorized" });
            }
            let generatedToken = await user.generateToken();

            res.cookie("token", generatedToken.token, {
              httpOnly: false,
            });
            res.cookie("refreshToken", generatedToken.refreshToken, {
              httpOnly: false,
            });
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
