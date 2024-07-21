import express, { Router } from "express";
import { createAccount, login } from "../controller/userAccount";

const router: Router = express.Router();

// Account based routers
router.post("/create", createAccount);
router.put("/login", login);

export default router;
