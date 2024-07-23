import express, { Router } from "express";
import {
  getNotified,
  getUserNotification,
  readNotification,
} from "../controller/notification";
import auth from "../controller/middleware";

const router: Router = express.Router();

router.get("/", auth, getNotified);
router.get("/list", auth, getUserNotification);
router.patch("/read/:time", auth, readNotification);

export default router;
