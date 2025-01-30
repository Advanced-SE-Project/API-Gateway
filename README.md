
# API Gateway

This API Gateway is designed to act as a unified access point between multiple microservices in the "Personal Budgeting Assistant" project. It facilitates seamless communication, routing, and proxying of requests to various backend services. 

## Features

- Proxying requests to microservices such as Transaction Management.
- Centralized logging for incoming requests and outgoing responses.
- Flexible path rewriting for API routing.
- Dynamic environment configurations via `.env` files.

## Vision

The API Gateway will serve as the backbone of the **Personal Budgeting Assistant** application. It will integrate multiple microservices, including:

- **User Authentication**: Secure user login and access management.
- **Analytics**: Provide financial insights and visual analytics.
- **Transaction Management**: Record and categorize income and expenses.
- **Budget Management**: (Future) Enable users to set and track budgets.

## Prerequisites

Ensure you have the following installed on your machine:

- Node.js (version 14.x or higher)
- npm (version 6.x or higher)

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd api-gateway
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the project root and configure the following environment variables:
   ```env
   PORT=3000
   TRANSACTION_SERVICE_URL=http://{transaction_service_url}:{transaction_service_port}
   AUTH_SERVICE_URL=http://{auth_service_url}:{auth_service_port}
   ANALYTICS_SERVICE_URL=http://{analytics_service_url}:{analytics_service_port}
   ```

## Usage

1. Start the API Gateway:
   ```bash
   npm start
   ```

2. The gateway will be running at `http://localhost:<PORT>`. Replace `<PORT>` with the value defined in your `.env` file.

3. Proxy requests to the Transaction Management microservice using the `/transaction-service` route.

## Future Development

The API Gateway will eventually support the following services:

- **User Authentication**: `/auth-service`
- **Analytics**: `/analytics-service`
- **Budget Management**: `/budget-service`

## File Structure

- `src/app.js`: Main entry point for the API Gateway.
- `src/routes/transaction.js`: Defines the proxy middleware for the Transaction Management service.
- `.env`: Environment configuration file.

## Dependencies

- `express`: Web framework for Node.js.
- `http-proxy-middleware`: Middleware for proxying HTTP requests.
- `dotenv`: Module for loading environment variables.

## Development

Use `nodemon` for development to automatically restart the server on file changes:
```bash
npx nodemon src/app.js
```

## License

This project is licensed under the ISC License.
