import swaggerJsdoc from "swagger-jsdoc";
import dotenv from "dotenv";

dotenv.config();

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "AddisMelody",
      version: "1.0.0",
      description: "Documentation for AddisMelody API's",
    },
    servers: [
      {
        url: process.env.SERVER_URL,
        description: "server url",
      },
    ],
  },
  apis: [
    "./route/userAccount.ts",
    "./route/notification.ts",
    "./route/song.ts",
    "./route/userAccount.js",
    "./route/notification.js",
    "./route/song.js",
  ],
};

const specs = swaggerJsdoc(options);

export { specs };
