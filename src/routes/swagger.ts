import { Router, Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';
import { fetchSwaggerDocs } from '../swagger/swaggerUtils';
import { url } from 'inspector';

const swaggerRouter = Router();

swaggerRouter.use('/', swaggerUi.serve, async (req: Request, res: Response) => {
    try {
        const backendSwaggerDocs = await fetchSwaggerDocs();

        // Merge the Swagger docs
        const swaggerDefinition = {
            openapi: '3.0.0',
            info: {
                title: 'API Gateway',
                version: '1.0.0',
                description: 'API Gateway for proxying requests to backend services.',
            },
            servers: [
                {
                    url: process.env.TRANSACTION_SERVICE_URL,
                },
                {
                    url: process.env.AUTH_SERVICE_URL,
                },
                {
                    url: process.env.ANALYTICS_SERVICE_URL
                }
            ],
            paths: {},
        };

        // Merge paths from all backend services into the API Gateway's Swagger definition
        backendSwaggerDocs.forEach((serviceSwagger) => {
            //@ts-ignore
            Object.assign(swaggerDefinition.paths, serviceSwagger.paths);
        });

        const swaggerSpec = swaggerJSDoc({
            swaggerDefinition,
            apis: ['./src/routes/*.ts', './src/routes/*.js'],
        });

        // Serve the merged Swagger UI
        //@ts-ignore
        return swaggerUi.setup(swaggerSpec)(req, res);
    } catch (err) {
        console.error('Error merging Swagger docs:', err);
        res.status(500).send('Error merging Swagger docs');
    }
});

export default swaggerRouter;
