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

dotenv.config();

const PORT = process.env.PORT;
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:5000';

const app = express();

// Function to fetch Swagger definitions from backend services
const fetchSwaggerDocs = async () => {
    const swaggerDocs = [];

    try {
        //const authServiceSwagger = await axios.get(`${process.env.AUTH_SERVICE_URL}/swagger.json`);
        //@ts-ignore
        //swaggerDocs.push(authServiceSwagger.data);

        //Add transaction service to swagger
        const transactionServiceSwagger = await axios.get(`http://localhost:5001/swagger.json`);
        const newPaths: any = {};
        Object.keys(transactionServiceSwagger.data.paths).forEach((path) => {
            // Add '/transaction-service' prefix to each path
            newPaths[`/transaction-service${path}`] = transactionServiceSwagger.data.paths[path];
        });
        //@ts-ignore
        swaggerDocs.push({ ...transactionServiceSwagger.data, paths: newPaths });

        return swaggerDocs;
    } catch (err) {
        console.error('Error fetching Swagger docs:', err);
        return [];
    }
};


// Set up Swagger UI at the `/swagger` endpoint
app.use('/swagger', swaggerUi.serve, async (req: Request, res: Response, next: NextFunction) => {
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
app.use(async (req: Request, res: Response, next: NextFunction) => {
    // Skip JWT validation for unprotected routes like register and login
    if (req.url.startsWith('/auth-service')) {
        next();
        return;
    }

    // Extract the token from Authorization header (Bearer token)
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        res.status(401).json({ message: 'Authorization token is missing' });
        return;
    }

    try {
        console.log("⚠⚠⚠")
        // Make a request to the authentication service to validate the token
        const response = await axios.post(`${AUTH_SERVICE_URL}/api/auth/validate`, {}, {
            headers: { 'authorization': `Bearer ${token}` }
        });

        if (response.status === 200 && response.data.valid) {
            console.log('JWT validated successfully');
            // Attach user data to the request object for further use in route handlers
            req.body = {};
            req.body.user = response.data.user;
            next();
            return;
        } else {
            res.status(401).json({ message: 'Invalid token' });
            return;
        }
    } catch (err) {
        console.error('Error during JWT validation:', err);
        res.status(500).json({ message: 'Failed to validate token' });
        return;
    }
});

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
