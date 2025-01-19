const { createProxyMiddleware } = require('http-proxy-middleware');
const router = require('express').Router();
require('dotenv').config();

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:5000';

router.use(
    '/',
    createProxyMiddleware({
        target: AUTH_SERVICE_URL,
        changeOrigin: true,
        pathRewrite: { '^/auth-service': '' }, // Strip the prefix
        logLevel: 'debug',
        onProxyReq: (proxyReq, req) => {
            // Forward headers
            if (req.headers['authorization']) {
                proxyReq.setHeader('Authorization', req.headers['authorization']);
            }

            // Forward body for POST requests
            if (req.body) {
                const bodyData = JSON.stringify(req.body);
                proxyReq.setHeader('Content-Type', 'application/json');
                proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
                proxyReq.write(bodyData);
            }
        },
    })
);

module.exports = router;