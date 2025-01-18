const express = require('express');
const router = express.Router();
const { createProxyMiddleware } = require('http-proxy-middleware');
const dotenv = require('dotenv');

dotenv.config();

// Middleware to log incoming requests to the gateway
router.use((req, res, next) => {
    console.log('Incoming Request to Analytics Gateway:', {
        method: req.method,
        url: req.url,
        query: req.query,
        body: req.body
    });
    next();
});

// Middleware to log outgoing responses from the gateway
router.use((req, res, next) => {
    res.on('finish', () => {
        console.log('Response from Analytics Gateway:', res.statusCode);
    });
    next();
});

router.use(
  '/',
  createProxyMiddleware({
    target: process.env.ANALYTICS_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { '^/analytics-service': '' },
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