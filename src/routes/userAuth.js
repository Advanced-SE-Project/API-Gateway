const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const dotenv = require('dotenv');

const router = express.Router();

// Load environment variables
dotenv.config();

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL;

// Log incoming requests to the gateway
router.use((req, res, next) => {
    console.log('Incoming Request to Gateway:', {
        method: req.method,
        url: req.url,
        body: req.body,
    });
    next();
});

// Log outgoing responses from the gateway
router.use((req, res, next) => {
    res.on('finish', () => {
        console.log('Response from Gateway:', res.statusCode);
    });
    next();
});

/**
 * @swagger
 * /auth:
 *   post:
 *     summary: Proxy to UserAuthentication Service
 *     description: >
 *       This API Gateway endpoint proxies requests to the UserAuthentication Service 
 *       for user registration and login.
 *     tags:
 *       - API Gateway
 *       - UserAuthentication Service
 *     requestBody:
 *       description: JSON object containing user data for authentication.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: The username of the user.
 *               password:
 *                 type: string
 *                 description: The password of the user.
 *             required:
 *               - username
 *               - password
 *     responses:
 *       200:
 *         description: Request successfully proxied to the UserAuthentication Service.
 *       502:
 *         description: Bad Gateway. Error while communicating with the UserAuthentication Service.
 *       500:
 *         description: Internal server error. Unexpected error occurred at the API Gateway.
 */
router.use(
    '/',
    createProxyMiddleware({
        target: AUTH_SERVICE_URL,
        changeOrigin: true,
        pathRewrite: { '^/auth': '' }, // Strip "/auth" from the path
        onProxyReq: (proxyReq, req) => {
            if (req.method === 'POST' && req.body) {
                const bodyData = JSON.stringify(req.body);
                proxyReq.setHeader('Content-Type', 'application/json');
                proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
                proxyReq.write(bodyData);
            }
        },
    })
);

module.exports = router;