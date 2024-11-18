const express = require('express');
const router = express.Router();
const { createProxyMiddleware } = require('http-proxy-middleware');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

router.use((req, res, next) => {
    console.log('Incoming Request to Gateway:', {
        method: req.method,
        url: req.url,
        body: req.body
    });
    next();
});

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
        pathRewrite: { '^/transaction-service': '' },
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

// Export the app
module.exports = router;