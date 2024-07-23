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

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - username
 *         - password
 *       properties:
 *         username:
 *           type: string
 *           description: Username of the user
 *         password:
 *           type: string
 *           description: Password of the user
 *       example:
 *         username: "john_doe"
 *         password: "Password123"
 */

/**
 * @swagger
 * /account/create:
 *   post:
 *     summary: Create a new account
 *     tags: [Account]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: Account created successfully
 *       400:
 *         description: Invalid input
 *       409:
 *         description: Account already exists
 *       500:
 *         description: Error creating account
 */

/**
 * @swagger
 * /account/login:
 *   put:
 *     summary: Login to an account
 *     tags: [Account]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Invalid username or password
 *       500:
 *         description: Please try again later
 */

/**
 * @swagger
 * /account/update:
 *   patch:
 *     summary: Update an account
 *     tags: [Account]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               profilePicture:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Required fields not supplied
 *       404:
 *         description: Account doesn't exist
 *       500:
 *         description: Error updating profile
 */

/**
 * @swagger
 * /account/profile/uploads/{image}:
 *   get:
 *     summary: Get profile picture
 *     tags: [Account]
 *     parameters:
 *       - in: path
 *         name: image
 *         required: true
 *         schema:
 *           type: string
 *         description: The name of the image
 *     responses:
 *       200:
 *         description: Profile picture retrieved
 *       404:
 *         description: Profile picture unavailable
 */
