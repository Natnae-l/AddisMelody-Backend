import { Request, Response } from "express";
import NotificationModel from "../model/notification";

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
  const id = req.cookies.token;
  const origin = req.headers.origin as string;

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

  if (save.has(id)) {
    save.get(id).add(res);
  } else {
    save.set(id, new Set());
    save.get(id).add(res);
  }
  console.log(save);

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

const readNotification = async (req: Request, res: Response): Promise<void> => {
  const time = req.query.time;
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
};
