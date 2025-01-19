import axios from 'axios'

// Function to fetch Swagger definitions from backend services
export const fetchSwaggerDocs = async () => {
    const swaggerDocs = [];

    try {
        //const authServiceSwagger = await axios.get(`${process.env.AUTH_SERVICE_URL}/swagger.json`);
        //@ts-ignore
        //swaggerDocs.push(authServiceSwagger.data);

        //Add transaction service to swagger
        const transactionServiceSwagger = await axios.get(`http://localhost:5001/swagger.json`);
        const newPaths: any = {};
        Object.keys(transactionServiceSwagger.data.paths).forEach((path) => {
            // Add '/transaction-service' prefix to each path
            newPaths[`/transaction-service${path}`] = transactionServiceSwagger.data.paths[path];
        });
        //@ts-ignore
        swaggerDocs.push({ ...transactionServiceSwagger.data, paths: newPaths });

        return swaggerDocs;
    } catch (err) {
        console.error('Error fetching Swagger docs:', err);
        return [];
    }
};
