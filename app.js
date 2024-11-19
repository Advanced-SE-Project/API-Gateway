const express = require('express');
const dotenv = require('dotenv');
const transactionServiceRouter = require('./src/routes/transaction');
const swaggerUi = require('swagger-ui-express');
const swaggerDocs = require('./src/swagger/swaggerConfig');
dotenv.config();

const port = process.env.PORT;
const app = express();

app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

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
    console.log("Swagger Docs available at http://localhost:4000/swagger");
});
