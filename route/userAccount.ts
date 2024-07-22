import express, { Router } from "express";
import {
  createAccount,
  getProfilePicture,
  login,
  updateProfile,
} from "../controller/userAccount";
import auth from "../controller/middleware";
import upload from "../controller/multer";

const router: Router = express.Router();

// Account based routers
router.post("/create", createAccount);
router.put("/login", login);
router.patch("/update", auth, upload.single("profilePicture"), updateProfile);
router.get("/profile/uploads/:image", auth, getProfilePicture);

export default router;
