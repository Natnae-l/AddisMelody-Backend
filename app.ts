import express, { Application } from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";

// load envionment variables
dotenv.config();

const app: Application = express();

// connect to datanase and start the application
mongoose
  .connect(process.env?.MONGO_URL || "")
  .then(() => {
    app.listen(process.env.PORT, () =>
      console.log(`app started listening on port: ${process.env.PORT}`)
    );
  })
  .catch((err) => {
    console.log(err);
    throw err;
  });
