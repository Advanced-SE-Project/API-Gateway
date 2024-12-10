import request from 'supertest'; // Importing supertest for HTTP requests
import express, { Request, Response, NextFunction } from 'express'; // Importing express types
import transactionRouter from '../routes/transaction'; // Importing the transaction router
import { createProxyMiddleware, Options } from 'http-proxy-middleware'; // Importing the proxy middleware and types

// Mocking the http-proxy-middleware createProxyMiddleware function
jest.mock('http-proxy-middleware', () => ({
    createProxyMiddleware: jest.fn((options: Options) => (req: Request, res: Response, next: NextFunction) => {
        // Mock logic for different HTTP methods
        if (req.method === 'GET') {
            if (options.target === 'simulate-502') {
                res.status(502).json({ error: 'Bad Gateway' });
            } else {
                res.status(200).json([
                    { id: '1', amount: 100, date: '03-05-2024' },
                ]);
            }
        } else if (req.method === 'POST') {
            if (req.body.amount && req.body.date) {
                res.status(201).json({ success: true });
            } else {
                res.status(400).json({ error: 'Bad Request' });
            }
        } else {
            next();
        }
    }),
}));

// Initialize Express app
const app = express();
app.use(express.json()); // Middleware to parse JSON bodies
app.use('/transaction-service', transactionRouter); // Use the transaction router on the '/transaction-service' endpoint

describe('Transaction Router Tests', () => {
    it('should log incoming requests', async () => {
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {}); // Mock console.log for verification
        await request(app).get('/transaction-service'); // Send a GET request to the gateway
        expect(consoleSpy).toHaveBeenCalledWith(
            'Incoming Request to Gateway:', // Check the console log format
            expect.objectContaining({
                body: {}, // Ensure that the body is empty for GET requests
                method: 'GET', // Ensure that the method is GET
                url: '/', // Ensure the URL is root
            })
        );
        consoleSpy.mockRestore(); // Restore console.log after the test
    });

    it('should forward GET /transaction-service and receive a 200 status', async () => {
        await request(app)
            .get('/transaction-service') // Send GET request
            .expect(200) // Expect 200 status code
            .expect((res) => {
                // Verify the response body matches the expected transaction data
                expect(res.body).toEqual([{ id: '1', amount: 100, date: '03-05-2024' }]);
            });
    });

    it('should forward POST /transaction-service and create a transaction', async () => {
        const payload = { amount: 100, description: 'Test', date: '03-05-2024' }; // Sample payload for creating a transaction

        await request(app)
            .post('/transaction-service') // Send POST request
            .send(payload) // Include the payload in the request
            .expect(201) // Expect 201 status code (Created)
            .expect((res) => {
                // Verify the response body indicates success
                expect(res.body).toEqual({ success: true });
            });
    });

    it('should handle 400 Bad Request for invalid payload', async () => {
        const payload = { amount: 100 }; // Invalid payload without 'date'

        await request(app)
            .post('/transaction-service') // Send POST request
            .send(payload) // Include the invalid payload
            .expect(400) // Expect 400 status code (Bad Request)
            .expect((res) => {
                // Verify the response body contains an error message
                expect(res.body).toEqual({ error: 'Bad Request' });
            });
    });

    it('should set headers and body in onProxyReq for POST requests', () => {
        const proxyReq = { setHeader: jest.fn(), write: jest.fn() }; // Mock proxy request object
        const req = { method: 'POST', body: { test: 'data' } }; // Mock request object with body

        // Access the 'onProxyReq' hook, which is called before proxying the request
        //@ts-ignore
        const hook = createProxyMiddleware.mock.calls[0][0].onProxyReq;
        hook(proxyReq, req); // Execute the hook

        // Verify that the correct headers are set
        expect(proxyReq.setHeader).toHaveBeenCalledWith('Content-Type', 'application/json');
        // Verify that the body is serialized correctly
        expect(proxyReq.write).toHaveBeenCalledWith(JSON.stringify({ test: 'data' }));
    });
});
