import express, { Router, Request, Response, NextFunction } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create an Express Router instance
const router: Router = express.Router();

// Middleware to log incoming requests
router.use((req: Request, _res: Response, next: NextFunction) => {
    console.log('Incoming Request to Gateway:', {
        method: req.method,
        url: req.url,
        body: req.body,
        target: process.env.AUTH_SERVICE_URL,
    });
    next();
});

// Middleware to log outgoing responses
router.use((req: Request, res: Response, next: NextFunction) => {
    res.on('finish', () => {
        console.log('Response from Gateway:', {
            statusCode: res.statusCode,
        });
    });
    next();
});

// Proxy Middleware
router.use(
    '/',
    createProxyMiddleware({
        target: process.env.AUTH_SERVICE_URL, // Target microservice
        changeOrigin: true, // Adjust origin to match the target
        pathRewrite: { '^/auth-service': '' }, // Remove '/auth-service' from the path
    })
);

export default router;
