import express, { Router } from "express";
import auth from "../controller/middleware";
import {
  deleteSongs,
  fetchFavouritesForUser,
  generateStatistics,
  getFile,
  getSongs,
  saveSongs,
  toggleFavourite,
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

router.get("/data/:file", getFile);
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
router.patch("/favourite/:id", auth, toggleFavourite);
router.get("/favourites", auth, fetchFavouritesForUser);

export default router;

/**
 * @swagger
 * components:
 *   schemas:
 *     Song:
 *       type: object
 *       required:
 *         - createdBy
 *         - title
 *         - artist
 *         - album
 *         - genre
 *       properties:
 *         createdBy:
 *           type: string
 *           description: ID of the user who created the song
 *         title:
 *           type: string
 *           description: Title of the song
 *         artist:
 *           type: string
 *           description: Artist of the song
 *         album:
 *           type: string
 *           description: Album in which the song is included
 *         genre:
 *           type: string
 *           description: Genre of the song
 *         banner:
 *           type: string
 *           description: URL of the banner image for the song
 *         audio:
 *           type: string
 *           description: URL of the audio file for the song
 *       example:
 *         createdBy: "60d21b4667d0d8992e610c85"
 *         title: "Song Title"
 *         artist: "Artist Name"
 *         album: "Album Name"
 *         genre: "Genre Name"
 *         banner: "http://example.com/banner.jpg"
 *         audio: "http://example.com/audio.mp3"
 */

/**
 * @swagger
 * /songs/list:
 *   get:
 *     summary: Get a list of songs
 *     tags: [Songs]
 *     parameters:
 *       - in: query
 *         name: page
 *         required: true
 *         schema:
 *           type: number
 *         description: page number
 *       - in: query
 *         name: genre
 *         required: false
 *         schema:
 *           type: string
 *         description: music genre
 *     responses:
 *       200:
 *         description: A list of songs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 songs:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Song'
 *       500:
 *         description: Error fetching songs
 */

/**
 * @swagger
 * /songs:
 *   post:
 *     summary: Save a new song
 *     tags: [Songs]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               artist:
 *                 type: string
 *               album:
 *                 type: string
 *               genre:
 *                 type: string
 *               audio:
 *                 type: string
 *                 format: binary
 *               banner:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Song added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Song'
 *       400:
 *         description: Invalid input
 */

/**
 * @swagger
 * /songs/data/{file}:
 *   get:
 *     summary: Get a song file
 *     tags: [Songs]
 *     parameters:
 *       - in: path
 *         name: file
 *         required: true
 *         schema:
 *           type: string
 *         description: The name of the file
 *     responses:
 *       200:
 *         description: The requested file
 *       404:
 *         description: Requested file unavailable
 */

/**
 * @swagger
 * /songs/update/{id}:
 *   patch:
 *     summary: Update an existing song
 *     tags: [Songs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the song
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               artist:
 *                 type: string
 *               album:
 *                 type: string
 *               genre:
 *                 type: string
 *               audio:
 *                 type: string
 *                 format: binary
 *               banner:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Song updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Song'
 *       400:
 *         description: Required fields not supplied
 *       404:
 *         description: Song doesn't exist
 *       500:
 *         description: Error updating song
 */

/**
 * @swagger
 * /songs/delete/{id}:
 *   delete:
 *     summary: Delete a song
 *     tags: [Songs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the song
 *     responses:
 *       200:
 *         description: Song deleted successfully
 *       500:
 *         description: Error deleting song
 */

/**
 * @swagger
 * /songs/statistics:
 *   get:
 *     summary: Get song statistics
 *     tags: [Songs]
 *     responses:
 *       200:
 *         description: Song statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalSongs:
 *                   type: integer
 *                 totalArtists:
 *                   type: integer
 *                 totalAlbums:
 *                   type: integer
 *                 totalGenres:
 *                   type: integer
 *                 genreCounts:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       count:
 *                         type: integer
 *                 artistAlbumCounts:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: object
 *                         properties:
 *                           artist:
 *                             type: string
 *                           album:
 *                             type: string
 *                       count:
 *                         type: integer
 *                 albumSongCounts:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       count:
 *                         type: integer
 *                 genreSongCounts:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       count:
 *                         type: integer
 *                 artistSongCounts:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       count:
 *                         type: integer
 *                 favoriteSongsCount:
 *                   type: integer
 *       400:
 *         description: Invalid request
 *       500:
 *         description: Error getting statistics
 */

/**
 * @swagger
 * /songs/favourite/{id}:
 *   patch:
 *     summary: Toggle favourite status of a song
 *     tags: [Songs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the song
 *     responses:
 *       200:
 *         description: Favourite status toggled
 *       404:
 *         description: Song not found
 *       500:
 *         description: Error toggling favourite
 */
