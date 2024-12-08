const express = require('express');
const router = express.Router();
const { createProxyMiddleware } = require('http-proxy-middleware');
const dotenv = require('dotenv');

dotenv.config();

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

/**
 * @swagger
 * /transaction-service:
 *   get:
 *     summary: Proxy to Transaction Service - Retrieve Transactions
 *     description: >
 *       This API Gateway endpoint proxies requests to the Transaction Service. 
 *       It retrieves a list of transactions by forwarding the request to the 
 *       configured Transaction Service backend.
 *     tags:
 *       - API Gateway
 *       - Transaction Service
 *     responses:
 *       200:
 *         description: Successfully retrieved transactions from the Transaction Service.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: Unique identifier for the transaction.
 *                   amount:
 *                     type: number
 *                     description: The amount involved in the transaction.
 *                   date:
 *                     type: string
 *                     format: date-time
 *                     description: The date and time of the transaction.
 *       502:
 *         description: Bad Gateway. Error while communicating with the Transaction Service.
 *       500:
 *         description: Internal server error. Unexpected error occurred at the API Gateway.
 *   post:
 *     summary: Proxy to Transaction Service - Create Transaction
 *     description: >
 *       This API Gateway endpoint proxies POST requests to the Transaction Service 
 *       to create a new transaction. It ensures proper headers and body are forwarded 
 *       to the backend service.
 *     tags:
 *       - API Gateway
 *       - Transaction Service
 *     requestBody:
 *       description: JSON object containing the details of the transaction to be created.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *                 description: The amount of the transaction.
 *               description:
 *                 type: string
 *                 description: Description or note for the transaction.
 *               date:
 *                 type: string
 *                 format: date-time
 *                 description: The date and time of the transaction.
 *             required:
 *               - amount
 *               - date
 *     responses:
 *       201:
 *         description: Transaction successfully created in the Transaction Service.
 *       400:
 *         description: Bad Request. Invalid input provided.
 *       502:
 *         description: Bad Gateway. Error while communicating with the Transaction Service.
 *       500:
 *         description: Internal server error. Unexpected error occurred at the API Gateway.
 */
router.use(
    '/',
    createProxyMiddleware({
        target: process.env.TRANSACTION_SERVICE_URL,
        changeOrigin: true, 
        pathRewrite: { '^/transaction-service': '' }, // Remove the "/transaction-service" prefix before forwarding

        // Handle proxy request modifications
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

module.exports = router;