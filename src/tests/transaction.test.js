const request = require('supertest');
const express = require('express');
const transactionRouter = require('../routes/transaction');
const { createProxyMiddleware } = require('http-proxy-middleware');

jest.mock('http-proxy-middleware', () => ({
    createProxyMiddleware: jest.fn((options) => (req, res, next) => {
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

const app = express();
app.use(express.json());
app.use('/transaction-service', transactionRouter);

describe('Transaction Router Tests', () => {
    it('should log incoming requests', async () => {
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
        await request(app).get('/transaction-service');
        expect(consoleSpy).toHaveBeenCalledWith(
            'Incoming Request to Gateway:',
            expect.objectContaining({
                body:{},
                method: 'GET',
                url: '/',
            })
        );
        consoleSpy.mockRestore();
    });

    it('should forward GET /transaction-service and receive a 200 status', async () => {
        await request(app)
            .get('/transaction-service')
            .expect(200)
            .expect((res) => {
                expect(res.body).toEqual([{ id: '1', amount: 100, date: '03-05-2024' }]);
            });
    });

    it('should forward POST /transaction-service and create a transaction', async () => {
        const payload = { amount: 100, description: 'Test', date: '03-05-2024' };

        await request(app)
            .post('/transaction-service')
            .send(payload)
            .expect(201)
            .expect((res) => {
                expect(res.body).toEqual({ success: true });
            });
    });

    it('should handle 400 Bad Request for invalid payload', async () => {
        const payload = { amount: 100 };

        await request(app)
            .post('/transaction-service')
            .send(payload)
            .expect(400)
            .expect((res) => {
                expect(res.body).toEqual({ error: 'Bad Request' });
            });
    });

    it('should set headers and body in onProxyReq for POST requests', () => {
        const proxyReq = { setHeader: jest.fn(), write: jest.fn() };
        const req = { method: 'POST', body: { test: 'data' } };
        const hook = createProxyMiddleware.mock.calls[0][0].onProxyReq;
        hook(proxyReq, req);
        expect(proxyReq.setHeader).toHaveBeenCalledWith('Content-Type', 'application/json');
        expect(proxyReq.write).toHaveBeenCalledWith(JSON.stringify({ test: 'data' }));
    });
});
