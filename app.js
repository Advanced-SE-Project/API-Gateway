const express = require('express');
const dotenv = require('dotenv');
const transactionServiceRouter = require('./src/routes/transaction');
const authServiceRouter = require('./src/routes/auth');
const swaggerUi = require('swagger-ui-express');
const swaggerDocs = require('./src/swagger/swaggerConfig');
const axios = require('axios');

dotenv.config();

const PORT = process.env.PORT;
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:5000';

const app = express();

// Set up Swagger UI at the `/swagger` endpoint
app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Middleware for validating JWT
app.use(async (req, res, next) => {
    // Skip JWT validation for unprotected routes like register and login
    if (req.url.startsWith('/api/auth/register') || req.url.startsWith('/api/auth/login')) { //ToDo: Move into Method
        return next();
    } 

    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Authorization token is missing' });
    }

    try {
        const response = await axios.post(`${AUTH_SERVICE_URL}/api/auth/validate`, {}, { headers: { 'authorization': req.headers['authorization'] } });

        if (response.status === 200 && response.data.valid) {
            console.log('JWT validated successfully');
            req.user = response.data.user;
            next();
        } else {
            return res.status(401).json({ message: 'Invalid token' });
        }
    } catch (err) {
        console.error('Error during JWT validation:', err);
        return res.status(500).json({ message: 'Failed to validate token' });
    }
});

app.use((req, res, next) => {
    console.log(`API Gateway received request: ${req.method} ${req.url}`);
    next();
});

// Auth routes
app.use('/auth-service', authServiceRouter);

// Transaction routes
app.use('/transaction-service', transactionServiceRouter);

// Start the server and listen on the configured port
app.listen(PORT, () => {
    console.log(`API Gateway Listening at http://localhost:${PORT}`);
    console.log("Swagger Docs available at http://localhost:4000/swagger");
});
