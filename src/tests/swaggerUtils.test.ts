import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { fetchSwaggerDocs } from '../swagger/swaggerUtils';

describe('fetchSwaggerDocs', () => {
    let mockAxios = new MockAdapter(axios);

    beforeEach(() => {
        mockAxios = new MockAdapter(axios); 
    });

    afterEach(() => {
        mockAxios.restore();
    });

    it('should fetch Swagger docs from multiple services and transform paths correctly', async () => {
        const mockServices = [
            { url: 'http://transaction-service', replaceThis: '/transaction-service' },
            { url: 'http://auth-service', replaceThis: '/auth-service' },
            { url: 'http://analytics-service', replaceThis: '/analytics-service' }
        ];

        process.env.TRANSACTION_SERVICE_URL = mockServices[0].url;
        process.env.AUTH_SERVICE_URL = mockServices[1].url;
        process.env.ANALYTICS_SERVICE_URL = mockServices[2].url;

        const mockSwaggerData1 = {
            paths: {
                '/endpoint1': { get: {} },
                '/endpoint2': { post: {} }
            }
        };

        const mockSwaggerData2 = {
            paths: {
                '/login': { post: {} },
                '/register': { post: {} }
            }
        };

        const mockSwaggerData3 = {
            paths: {
                '/stats': { get: {} },
                '/reports': { get: {} }
            }
        };

        mockAxios
            .onGet(`${mockServices[0].url}/swagger.json`)
            .reply(200, mockSwaggerData1);

        mockAxios
            .onGet(`${mockServices[1].url}/swagger.json`)
            .reply(200, mockSwaggerData2);

        mockAxios
            .onGet(`${mockServices[2].url}/swagger.json`)
            .reply(200, mockSwaggerData3);

        const result = await fetchSwaggerDocs();

        expect(result).toEqual([
            {
                ...mockSwaggerData1,
                paths: {
                    '/transaction-service/endpoint1': mockSwaggerData1.paths['/endpoint1'],
                    '/transaction-service/endpoint2': mockSwaggerData1.paths['/endpoint2']
                }
            },
            {
                ...mockSwaggerData2,
                paths: {
                    '/auth-service/login': mockSwaggerData2.paths['/login'],
                    '/auth-service/register': mockSwaggerData2.paths['/register']
                }
            },
            {
                ...mockSwaggerData3,
                paths: {
                    '/analytics-service/stats': mockSwaggerData3.paths['/stats'],
                    '/analytics-service/reports': mockSwaggerData3.paths['/reports']
                }
            }
        ]);
    });

    it('should return an empty array if fetching Swagger docs fails', async () => {
        const mockServices = [
            { url: 'http://transaction-service', replaceThis: '/transaction-service' },
            { url: 'http://auth-service', replaceThis: '/auth-service' },
            { url: 'http://analytics-service', replaceThis: '/analytics-service' }
        ];

        process.env.TRANSACTION_SERVICE_URL = mockServices[0].url;
        process.env.AUTH_SERVICE_URL = mockServices[1].url;
        process.env.ANALYTICS_SERVICE_URL = mockServices[2].url;

        mockAxios
            .onGet(`${mockServices[0].url}/swagger.json`)
            .reply(500);

        mockAxios
            .onGet(`${mockServices[1].url}/swagger.json`)
            .reply(500);

        mockAxios
            .onGet(`${mockServices[2].url}/swagger.json`)
            .reply(500);

        const result = await fetchSwaggerDocs();

        expect(result).toEqual([]);
    });
});