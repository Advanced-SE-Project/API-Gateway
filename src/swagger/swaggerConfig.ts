import swaggerJsDoc from 'swagger-jsdoc';
import dotenv from 'dotenv';
dotenv.config();

const port = process.env.PORT;

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API Gateway",
      version: "1.0.0",
      description: "API Gateway Documentation",
    },
    servers: [
      {
        url: `http://localhost:${port}`, 
      },
    ],
  },
  apis: ["./src/routes/*.js"], // Points to files with JSDoc comments
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

export default swaggerDocs;
