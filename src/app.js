const express = require('express');
const dotenv = require('dotenv');
const transactionServiceRouter = require('./routes/transaction');
dotenv.config();

const port = process.env.PORT;
const app = express();

// Use json middleware only for non-proxied routes
app.use((req, res, next) => {
    if (!req.url.startsWith('/transaction-service')) {
        express.json()(req, res, next);
    } else {
        next();
    }
});

app.use((req, res, next) => {
    console.log(`API Gateway received request: ${req.method} ${req.url}`);
    next();
});

// Proxy routes
app.use('/transaction-service', transactionServiceRouter);

app.listen(port, () => {
    console.log(`API Gateway Listening at http://localhost:${port}`);
});
