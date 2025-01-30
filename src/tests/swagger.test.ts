import request from 'supertest';
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerRouter from '../routes/swagger'; // Adjust the import path accordingly
import { fetchSwaggerDocs } from '../swagger/swaggerUtils'; // Adjust the import path accordingly

// Mock dependencies
jest.mock('swagger-ui-express');
jest.mock('swagger-jsdoc');
jest.mock('../swagger/swaggerUtils');

const mockedFetchSwaggerDocs = fetchSwaggerDocs as jest.MockedFunction<typeof fetchSwaggerDocs>;
const mockedSwaggerJsDoc = swaggerJSDoc as jest.MockedFunction<typeof swaggerJSDoc>;
const mockedSwaggerSetup = swaggerUi.setup as jest.MockedFunction<typeof swaggerUi.setup>;

describe('swaggerRouter', () => {
    let app: express.Express;

    beforeEach(() => {
        app = express();
        app.use(swaggerRouter);
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    it('should serve Swagger UI with merged Swagger docs', async () => {
        const mockSwaggerDocs = [
            {
                paths: {
                    '/transaction-service/endpoint1': { get: {} },
                    '/transaction-service/endpoint2': { post: {} }
                }
            },
            {
                paths: {
                    '/auth-service/login': { post: {} },
                    '/auth-service/register': { post: {} }
                }
            },
            {
                paths: {
                    '/analytics-service/stats': { get: {} },
                    '/analytics-service/reports': { get: {} }
                }
            }
        ];

        mockedFetchSwaggerDocs.mockResolvedValue(mockSwaggerDocs);

        const mockSwaggerSpec = {
            openapi: '3.0.0',
            info: {
                title: 'API Gateway',
                version: '1.0.0',
                description: 'API Gateway for proxying requests to backend services.',
            },
            servers: [
                { url: process.env.TRANSACTION_SERVICE_URL },
                { url: process.env.AUTH_SERVICE_URL },
                { url: process.env.ANALYTICS_SERVICE_URL }
            ],
            paths: {
                '/transaction-service/endpoint1': { get: {} },
                '/transaction-service/endpoint2': { post: {} },
                '/auth-service/login': { post: {} },
                '/auth-service/register': { post: {} },
                '/analytics-service/stats': { get: {} },
                '/analytics-service/reports': { get: {} }
            }
        };
        mockedSwaggerJsDoc.mockReturnValue(mockSwaggerSpec);

        const mockSetupMiddleware = jest.fn((_req, res) => res.send('Swagger UI'));
        mockedSwaggerSetup.mockReturnValue(mockSetupMiddleware);

        const response = await request(app).get('/');

        expect(fetchSwaggerDocs).toHaveBeenCalledTimes(1);
        expect(swaggerJSDoc).toHaveBeenCalledWith({
            swaggerDefinition: {
                openapi: '3.0.0',
                info: {
                    title: 'API Gateway',
                    version: '1.0.0',
                    description: 'API Gateway for proxying requests to backend services.',
                },
                servers: [
                    { url: process.env.TRANSACTION_SERVICE_URL },
                    { url: process.env.AUTH_SERVICE_URL },
                    { url: process.env.ANALYTICS_SERVICE_URL }
                ],
                paths: {
                    '/transaction-service/endpoint1': { get: {} },
                    '/transaction-service/endpoint2': { post: {} },
                    '/auth-service/login': { post: {} },
                    '/auth-service/register': { post: {} },
                    '/analytics-service/stats': { get: {} },
                    '/analytics-service/reports': { get: {} }
                }
            },
            apis: ['./src/routes/*.ts', './src/routes/*.js']
        });

        expect(swaggerUi.setup).toHaveBeenCalledWith(mockSwaggerSpec);
        expect(mockSetupMiddleware).toHaveBeenCalled();
        expect(response.status).toBe(200);
        expect(response.text).toBe('Swagger UI');
    });

    it('should return 500 if merging Swagger docs fails', async () => {
        mockedFetchSwaggerDocs.mockRejectedValue(new Error('Failed to fetch Swagger docs'));

        const response = await request(app).get('/');

        expect(fetchSwaggerDocs).toHaveBeenCalledTimes(1);
        expect(response.status).toBe(500);
        expect(response.text).toBe('Error merging Swagger docs');
    });
});
