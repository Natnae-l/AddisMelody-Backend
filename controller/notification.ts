import { Request, Response } from "express";
import NotificationModel from "../model/notification";
import jwt from "jsonwebtoken";
import { Id } from "./middleware";

const save = new Map();

interface Notification {
  to: string;
  title: string;
  body: string;
  time: number;
  read: boolean;
}

const allowedOrigins = [
  "http://localhost:5173",
  "https://addis-melody.netlify.app",
];

const getNotified = (req: Request, res: Response) => {
  let id: string | null = null;
  const origin = req.headers.origin as string;
  const token = req.cookies.token;
  const refreshToken = req.cookies.refreshToken;

  if (token && refreshToken) {
    let auth;
    try {
      auth = jwt.verify(token, process.env.JWT_SECRET as string) as Id;
      if (auth) {
        id = auth._id;
      }
    } catch (error) {
      try {
        auth = jwt.verify(refreshToken, process.env.JWT_SECRET as string) as Id;
        if (auth) {
          const token: string = jwt.sign(
            { _id: auth._id },
            process.env.JWT_SECRET as string,
            {
              expiresIn: 60,
            }
          );
          const refreshToken: string = jwt.sign(
            { _id: auth._id },
            process.env.JWT_SECRET as string,
            { expiresIn: 60 * 60 }
          );
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
          id = auth._id;
        }
      } catch (error) {
        console.log(error);
        return res.status(401).json({ message: "not authorized" });
      }
    }
  }

  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  } else {
    res.setHeader("Access-Control-Allow-Origin", "null");
  }

  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "Access-Control-Allow-Credentials": "true", // If credentials are required
    "Access-Control-Allow-Methods": "*",
  });
  if (id) {
    if (save.has(id)) {
      save.get(id).add(res);
    } else {
      save.set(id, new Set());
      save.get(id).add(res);
    }
  }

  req.on("close", () => {
    console.log(`Connection closed for merchant ${id}`);
    save.get(id).delete(res);
  });
};

const getUserNotification = async (req: Request, res: Response) => {
  try {
    const notifications = await NotificationModel.find({
      to: req.query._id,
    }).sort({ _id: -1 });

    res.status(200).send({
      data: notifications,
      token: req.query.token,
      refreshToken: req.query.refreshToken,
    });
  } catch (error) {
    res.status(500).send({
      message: "error reading notifications",
      token: req.query.token,
      refreshToken: req.query.refreshToken,
    });
  }
};

const sendNotification = async (notification: Notification): Promise<void> => {
  try {
    if (save.has(notification.to)) {
      for (let res of save.get(notification.to)) {
        res.write(
          `data:${JSON.stringify({
            type: "notification",
            data: notification,
          })}\n\n`
        );
      }
    }
    await NotificationModel.create(notification);
  } catch (error: any) {
    throw new Error(error.message);
  }
};

const sendStatistics = async (to: string, statistics: any) => {
  if (save.has(to)) {
    for (let res of save.get(to)) {
      res.write(
        `data:${JSON.stringify({
          type: "statistics",
          data: statistics,
        })}\n\n`
      );
    }
  }
};

const sendNotificationOne = async (to: string, statistics: any) => {
  if (save.has(to)) {
    for (let res of save.get(to)) {
      res.write(
        `data:${JSON.stringify({
          type: "notification",
          data: statistics,
        })}\n\n`
      );
    }
  }
};

const readNotification = async (req: Request, res: Response): Promise<void> => {
  const time = req.params.time;

  try {
    await NotificationModel.updateMany(
      {
        time: { $lte: time },
      },
      { read: true }
    );

    res.status(200).send({
      message: "notifications marked as read",
      token: req.query.token,
      refreshToken: req.query.refreshToken,
    });
  } catch (error) {
    res.status(500).send({
      message: "error reading notification",
      token: req.query.token,
      refreshToken: req.query.refreshToken,
    });
  }
};

export {
  getNotified,
  sendNotification,
  readNotification,
  getUserNotification,
  sendStatistics,
  sendNotificationOne,
};
