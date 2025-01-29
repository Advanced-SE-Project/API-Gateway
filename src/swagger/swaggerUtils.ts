import axios from 'axios'

// Function to fetch Swagger definitions from backend services
export const fetchSwaggerDocs = async () => {
    const services = [{ url: process.env.TRANSACTION_SERVICE_URL, replaceThis: '/transaction-service' }, { url: process.env.AUTH_SERVICE_URL, replaceThis: '/auth-service' }, { url: process.env.ANALYTICS_SERVICE_URL, replaceThis: '/analytics-service' }]
    const swaggerDocs = [];

    try {
        for (let i = 0; i < services.length; i++) {
            let service = services[i];

            const serviceSwagger = await axios.get(`${service.url}/swagger.json`);
            const newPaths: any = {};
            Object.keys(serviceSwagger.data.paths).forEach((path) => {
                newPaths[`${service.replaceThis}${path}`] = serviceSwagger.data.paths[path];
            });
            //@ts-ignore
            swaggerDocs.push({ ...serviceSwagger.data, paths: newPaths });
        }

        return swaggerDocs;
    } catch (err) {
        console.error('Error fetching Swagger docs:', err);
        return [];
    }
};
