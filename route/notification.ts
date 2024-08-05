import express, { Router } from "express";
import {
  getNotified,
  getUserNotification,
  readNotification,
} from "../controller/notification";
import auth from "../controller/middleware";

const router: Router = express.Router();

router.get("/", getNotified);
router.get("/list", auth, getUserNotification);
router.patch("/read/:time", auth, readNotification);

export default router;

/**
 * @swagger
 * definitions:
 *   Notification:
 *     type: object
 *     properties:
 *       title:
 *         type: string
 *         description: The title of the notification
 *       body:
 *         type: string
 *         description: The body of the notification
 *       time:
 *         type: integer
 *         description: The time the notification was sent
 *       read:
 *         type: boolean
 *         description: Whether the notification has been read
 *     required:
 *       - title
 *       - body
 *       - time
 *       - read
 */

/**
 * @swagger
 * /notification/:
 *   get:
 *     summary: Get notified
 *     tags: [Notification]
 *     description: Streams notifications to the client
 *     parameters:
 *       - name: _id
 *         in: query
 *         required: true
 *         description: User ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notification stream
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /notification/list:
 *   get:
 *     summary: Get user notifications
 *     tags: [Notification]
 *     description: Fetches all notifications for a user
 *     responses:
 *       200:
 *         description: A list of notifications
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/definitions/Notification'
 *       500:
 *         description: Error reading notifications
 */

/**
 * @swagger
 * /notification/read/{time}:
 *   patch:
 *     summary: Mark notifications as read
 *     tags: [Notification]
 *     description: Marks all notifications before a certain time as read
 *     parameters:
 *       - name: time
 *         in: path
 *         required: true
 *         description: Timestamp to mark notifications as read up to
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Notifications marked as read
 *       500:
 *         description: Error reading notification
 */
