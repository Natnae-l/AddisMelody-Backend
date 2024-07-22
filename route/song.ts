import express, { Router } from "express";
import auth from "../controller/middleware";
import { getSongs, saveSongs } from "../controller/song";
import upload from "../controller/multer";

const router: Router = express();

router.get("/list", auth, getSongs);
router.post(
  "/",
  upload.fields([
    { name: "audio", maxCount: 1 },
    { name: "banner", maxCount: 1 },
  ]),
  saveSongs
);

export default router;
