import express, { Router } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import dotenv from 'dotenv';

dotenv.config();

const router: Router = express.Router();

// Middleware to log incoming requests to the gateway
router.use((req, res, next) => {
    console.log('Incoming Request to Gateway:', {
        method: req.method,
        url: req.url,
        body: req.body,
    });
    next();
});

// Middleware to log outgoing responses from the gateway
router.use((req, res, next) => {
    res.on('finish', () => {
        console.log('Response from Gateway:', res.statusCode);
    });
    next();
});

router.use(
    '/',
    createProxyMiddleware({
        target: process.env.TRANSACTION_SERVICE_URL,
        changeOrigin: true,
        pathRewrite: { '^/transaction-service': '' }, // Remove the "/transaction-service" prefix before forwarding
    })
);

export default router;