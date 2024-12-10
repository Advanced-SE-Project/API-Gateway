// Import required modules
import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import swaggerDocs from './src/swagger/swaggerConfig';
import axios from 'axios';
import authRouter from './src/routes/auth';
import transactionRouter from './src/routes/transaction';
import { NextFunction } from 'http-proxy-middleware/dist/types';

dotenv.config();

const PORT = process.env.PORT;
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:5000';

const app = express();

// Set up Swagger UI at the `/swagger` endpoint
app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

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

export default app;