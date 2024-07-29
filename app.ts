import express, { Application, Request, Response } from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import swaggerUi, { serve } from "swagger-ui-express";
import { specs } from "./swagger";
import userAccount from "./route/userAccount";
import songs from "./route/song";
import cookieParser from "cookie-parser";
import cors from "cors";
import notifications from "./route/notification";

// load envionment variables
dotenv.config();

const app: Application = express();

const limiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: "Too many requests, please try again later.",
});
// cors config
app.use(
  cors({
    origin: "https://addismelody-frontend.onrender.com", // Replace with your frontend URL
    credentials: true,
  })
);

// parsers
app.use(express.json());
app.use(cookieParser());

// Apply the rate limiting middleware to all requests.
app.use(limiter);
// Apply appropirate headers
app.use(helmet());

// load API documentaiion
app.use("/api-docs", serve, swaggerUi.setup(specs));

// user account based routes
app.use("/account", userAccount);
// song router
app.use("/songs", songs);
// notification router
app.use("/notification", notifications);

// unavailable routes to be handled here
app.use((req: Request, res: Response) => {
  res.status(404).send({ message: "Requested url unavailable" });
  return;
});

// connect to database and start the application
mongoose
  .connect(process.env.MONGO_URL as string)
  .then(() => {
    app.listen(process.env.PORT, () =>
      console.log(`app started listening on port: ${process.env.PORT}`)
    );
  })
  .catch((err) => {
    console.log(err);
    throw err;
  });
