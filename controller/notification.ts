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

const getNotified = (req: Request, res: Response) => {
  const id = `${req.query._id}`;

  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "*",
  });

  if (save.has(id)) {
    save.get(id).add(res);
  } else {
    save.set(id, new Set());
    save.get(id).add(res);
  }

  req.on("close", () => {
    console.log(`Connection closed for merchant ${id}`);
    save.get(id).delete(res);
    console.log(save);
  });
};

const sendNotification = async (notification: Notification): Promise<void> => {
  try {
    if (save.has(notification.to)) {
      for (let res of save.get(notification.to)) {
        console.log(res);
        res.write(`data: hi\n\n`);
        console.log("i");
      }
    }
    await NotificationModel.create(notification);
  } catch (error) {
    throw new Error("error sending notification");
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

    res.status(200).send({ message: "notifications marked as read" });
  } catch (error) {
    res.status(500).send({ message: "error reading notification" });
  }
};

export { getNotified, sendNotification, readNotification };
