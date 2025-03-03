import axios from "axios";
import { NextFunction, Request, Response } from "express";
import dotenv from 'dotenv';

dotenv.config();


export const verifyJwtMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const allowedOrigins = [
        process.env.TRANSACTION_SERVICE_URL,
        process.env.AUTH_SERVICE_URL,
        process.env.ANALYTICS_SERVICE_URL,
    ];

    // Allow requests to bypass authentication if from allowed origins
    const requestOrigin = req.headers.origin;
    if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
        return next();
    }

    // Skip JWT validation for unprotected routes like register and login
    console.log("req.url", req.url, req.url.includes('auth-service'))
    if (req.url.includes('/auth-service')) {
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
        // Make a request to the authentication service to validate the token
        const response = await axios.post(`${process.env.AUTH_SERVICE_URL}/api/auth/validate`, {}, {
            headers: { 'authorization': `Bearer ${token}` },
            validateStatus: () => true
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
}