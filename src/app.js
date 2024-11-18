const express = require('express');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();

// Middleware for parsing JSON
app.use(express.json());

// Import route modules
const transactionRoutes = require('./routes/transaction');
const userRoutes = require('./routes/user');
const analyticsRoutes = require('./routes/analytics');

// Use routes
app.use('/api', transactionRoutes);
// app.use('/users', userRoutes);
// app.use('/analytics', analyticsRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).send('API Gateway is running!');
});

// Export the app
module.exports = app;
