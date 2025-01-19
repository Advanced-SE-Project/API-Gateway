// Import required modules
import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import swaggerDocs from './src/swagger/swaggerConfig';
import axios from 'axios';
import authRouter from './src/routes/auth';
import transactionRouter from './src/routes/transaction';
import { NextFunction } from 'http-proxy-middleware/dist/types';
import swaggerJSDoc from 'swagger-jsdoc';
import { fetchSwaggerDocs } from './src/swagger/swaggerUtils';
import { verifyJwtMiddleware } from './src/middleware/verifyJwtMiddleware';
import cors from 'cors';

dotenv.config();

const PORT = process.env.PORT;

const app = express();
app.use(cors());


// Set up Swagger UI at the `/swagger` endpoint
app.use('/swagger/', swaggerUi.serve, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const backendSwaggerDocs = await fetchSwaggerDocs();

        // Merge the Swagger docs
        const swaggerDefinition = {
            openapi: '3.0.0',
            info: {
                title: 'API Gateway',
                version: '1.0.0',
                description: 'API Gateway for proxying requests to backend services.',
            },
            servers: [
                {
                    url: 'http://localhost:5001',
                },
            ],
            paths: {},
        };

        // Merge each backend service Swagger file into the API Gateway
        backendSwaggerDocs.forEach((serviceSwagger) => {
            //@ts-ignore
            Object.assign(swaggerDefinition.paths, serviceSwagger.paths);
        });

        const swaggerSpec = swaggerJSDoc({
            swaggerDefinition,
            apis: ['./src/routes/*.ts', './src/routes/*.js'],
        });

        // Serve the merged Swagger UI
        //@ts-ignore
        return swaggerUi.setup(swaggerSpec)(req, res);
    } catch (err) {
        console.error('Error merging Swagger docs:', err);
        res.status(500).send('Error merging Swagger docs');
    }
});

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

// Start the server and listen on the configured port
app.listen(PORT, () => {
    console.log(`API Gateway Listening at http://localhost:${PORT}`);
    console.log("Swagger Docs available at http://localhost:4000/swagger");
});


export default app;