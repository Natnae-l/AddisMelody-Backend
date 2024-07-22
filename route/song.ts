import express, { Router } from "express";
import auth from "../controller/middleware";
import { getSongs } from "../controller/song";

const router: Router = express();

router.get("/list", auth, getSongs);

export default router;
