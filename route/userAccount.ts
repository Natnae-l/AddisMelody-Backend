import express, { Router } from "express";
import { createAccount, login, updateProfile } from "../controller/userAccount";
import path from "path";
import multer from "multer";
import auth from "../controller/middleware";

const router: Router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../uploads/"));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

// Account based routers
router.post("/create", createAccount);
router.put("/login", login);
router.patch("/update", auth, upload.single("profileImage"), updateProfile);

export default router;
