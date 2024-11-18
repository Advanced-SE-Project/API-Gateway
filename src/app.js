const express = require('express');
const dotenv = require('dotenv');
const transactionServiceRouter = require('./routes/transaction')

// Load environment variables
dotenv.config();

const port = process.env.PORT;
const app = express();

// Middleware for parsing JSON
app.use(express.json());

app.use((req, res, next) => {
    console.log(`Transaction Microservice received request: ${req.method} ${req.url}`);
    console.log('Request Body:', req.body);
    next();
});

app.use('/transaction-service', transactionServiceRouter);

app.listen(port, () => {
    console.log(`API Gateway Listening at http://localhost:${port}`)
});

// Export the app
module.exports = app;
