const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const router = express.Router();
const dotenv = require('dotenv'); 

dotenv.config();

router.use((req, res, next) => {
    console.log('Incoming Request to Gateway:', {
        method: req.method, 
        url: req.url, 
        body: req.body, 
        target: process.env.AUTH_SERVICE_URL
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
        target: process.env.AUTH_SERVICE_URL,
        changeOrigin: true, 
        pathRewrite: { '^/auth-service': '' },
        onProxyReq: (proxyReq, req) => {
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
