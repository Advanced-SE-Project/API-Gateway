import request from 'supertest';
import express, { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { verifyJwtMiddleware } from '../../src/middleware/verifyJwtMiddleware';

const app = express();
app.use(express.json()); // Middleware to parse JSON
app.use(verifyJwtMiddleware);

// Create a mock route to test middleware
app.get('/protected-route', (req: Request, res: Response) => {
    res.status(200).json({ message: 'Access granted', user: req.body.user });
});

// Mock Axios for external request simulation
const mock = new MockAdapter(axios);

// Environment variables
process.env.AUTH_SERVICE_URL = 'http://localhost:5000';
process.env.TRANSACTION_SERVICE_URL = 'http://localhost:5001';
process.env.ANALYTICS_SERVICE_URL = 'http://localhost:5002';

describe('verifyJwtMiddleware', () => {
    afterEach(() => {
        mock.reset(); // Reset mock after each test
    });

    test('should allow request from allowed origin without authentication', async () => {
        const res = await request(app)
            .get('/protected-route')
            .set('Origin', process.env.TRANSACTION_SERVICE_URL!); // Mock Origin header

        expect(res.status).toBe(200);
        expect(res.body).toEqual({ message: 'Access granted', user: undefined });
    });

    test('should allow request to /auth-service without authentication, returns 404', async () => {
        const res = await request(app).get('/auth-service/login');

        expect(res.status).toBe(404);
        expect(res.body).toEqual({});
    });

    test('should return 401 if no token is provided', async () => {
        const res = await request(app).get('/protected-route');

        expect(res.status).toBe(401);
        expect(res.body).toEqual({ message: 'Authorization token is missing' });
    });

    test('should return 401 for invalid token', async () => {
        mock.onPost(`${process.env.AUTH_SERVICE_URL}/api/auth/validate`).reply(401, { valid: false });

        const res = await request(app)
            .get(`/transaction-service/`)
            .set('Authorization', 'Bearer invalidToken');

        expect(res.status).toBe(401);
        expect(res.body).toEqual({ message: 'Invalid token' });
    });

    test('should return 500 if auth service request fails', async () => {
        mock.onPost(`${process.env.AUTH_SERVICE_URL}/api/auth/validate`).networkError();

        const res = await request(app)
            .get('/protected-route')
            .set('Authorization', 'Bearer someToken');

        expect(res.status).toBe(500);
        expect(res.body).toEqual({ message: 'Failed to validate token' });
    });

    test('should allow request with valid token', async () => {
        const userData = { id: '123', email: 'test@example.com' };
        mock.onPost(`${process.env.AUTH_SERVICE_URL}/api/auth/validate`).reply(200, { valid: true, user: userData });

        const res = await request(app)
            .get('/protected-route')
            .set('Authorization', 'Bearer validToken');

        expect(res.status).toBe(200);
        expect(res.body).toEqual({ message: 'Access granted', user: userData });
    });
});
