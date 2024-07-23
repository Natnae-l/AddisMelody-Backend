import express, { Router } from "express";
import { getNotified, readNotification } from "../controller/notification";
import auth from "../controller/middleware";

const router: Router = express.Router();

router.get("/:id", auth, getNotified);
router.patch("/read/:time", auth, readNotification);

export default router;
