const express = require('express');
const dotenv = require('dotenv');
const transactionServiceRouter = require('./src/routes/transaction');
const authServiceRouter = require('./src/routes/auth');
const swaggerUi = require('swagger-ui-express');
const swaggerDocs = require('./src/swagger/swaggerConfig');
const axios = require('axios');
const cors = require('cors');

dotenv.config();

const app = express();
const port = process.env.PORT || 2000;

// Middleware
app.use(cors()); // Allow frontend communication
app.use(express.json()); // Parse JSON requests

// Swagger Documentation
app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// JWT Middleware for Authentication
app.use(async (req, res, next) => {
    // Skip JWT validation for public routes
    if (req.url.startsWith('/auth-service/api/auth/register') || req.url.startsWith('/auth-service/api/auth/login')) {
        return next();
    }

    // Extract token
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Authorization token is missing' });
    }

    // Validate token via userAuth service
    try {
        const response = await axios.post(
            `${process.env.AUTH_SERVICE_URL}/api/auth/validate`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.status === 200 && response.data.valid) {
            req.user = response.data.user;
            next();
        } else {
            return res.status(401).json({ message: 'Invalid token' });
        }
    } catch (error) {
        console.error('JWT validation failed:', error.message);
        return res.status(500).json({ message: 'Token validation failed', error: error.message });
    }
});

// Proxy Routes
app.use('/transaction-service', transactionServiceRouter);
app.use('/auth-service', authServiceRouter);

// Start Server
app.listen(port, () => {
    console.log(`API Gateway running at http://localhost:${port}`);
    console.log("Swagger Docs available at http://localhost:4000/swagger");
});
