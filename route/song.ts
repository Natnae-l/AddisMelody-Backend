import express, { Router } from "express";
import auth from "../controller/middleware";
import {
  deleteSongs,
  generateStatistics,
  getFile,
  getSongs,
  saveSongs,
  updateSong,
} from "../controller/song";
import upload from "../controller/multer";

const router: Router = express();

router.get("/list", auth, getSongs);
router.post(
  "/",
  auth,
  upload.fields([
    { name: "audio", maxCount: 1 },
    { name: "banner", maxCount: 1 },
  ]),
  saveSongs
);
router.get("/data/:file", auth, getFile);
router.patch(
  "/update/:id",
  auth,
  upload.fields([
    { name: "audio", maxCount: 1 },
    { name: "banner", maxCount: 1 },
  ]),
  updateSong
);
router.get("/statistics", auth, generateStatistics);
router.delete("/delete/:id", auth, deleteSongs);

export default router;
