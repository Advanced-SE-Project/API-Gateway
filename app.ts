// Import required modules
import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import swaggerDocs from './src/swagger/swaggerConfig';
import axios from 'axios';
import authRouter from './src/routes/auth';
import transactionRouter from './src/routes/transaction';
import analyticsRouter from './src/routes/analytics';
import { NextFunction } from 'http-proxy-middleware/dist/types';
import swaggerJSDoc from 'swagger-jsdoc';
import { fetchSwaggerDocs } from './src/swagger/swaggerUtils';
import { verifyJwtMiddleware } from './src/middleware/verifyJwtMiddleware';
import cors from 'cors';
import swaggerRouter from './src/routes/swagger';

dotenv.config();

const PORT = process.env.PORT;


const app = express();
app.use(cors());


// Set up Swagger UI at the `/swagger` endpoint
app.use('/swagger', swaggerRouter);

// Middleware for validating JWT
// JWT validation middleware
app.use(verifyJwtMiddleware);

app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`API Gateway received request: ${req.method} ${req.url}`);
    next();
});

// Auth routes
app.use('/auth-service', authRouter);

// Transaction routes
app.use('/transaction-service', transactionRouter);

app.use('/analytics-service', analyticsRouter);


// Start the server and listen on the configured port
app.listen(PORT, () => {
    console.log(`API Gateway Listening at http://localhost:${PORT}`);
    console.log("Swagger Docs available at http://localhost:4000/swagger");
});


export default app;