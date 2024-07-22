import express, { Application } from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import swaggerUi, { serve } from "swagger-ui-express";
import { specs } from "./swagger";
import userAccount from "./route/userAccount";
import cookieParser from "cookie-parser";

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
