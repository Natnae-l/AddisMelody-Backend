import swaggerJsdoc from "swagger-jsdoc";

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
  apis: ["./route/userAccount.ts"],
};

const specs = swaggerJsdoc(options);

export { specs };
