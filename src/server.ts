/**
 * ===========================================
 * SigmaPay Backend Server
 * ===========================================
 * 
 * Non-custodial payment gateway for the Ergo Blockchain.
 * 
 * This server provides payment verification services for merchants,
 * allowing them to verify that customers have made payments without
 * trusting the customer's frontend or handling crypto themselves.
 * 
 * Architecture Overview:
 * ----------------------
 * 1. Customer initiates payment via their Ergo wallet
 * 2. Customer's frontend sends transaction ID to this backend
 * 3. Backend verifies the transaction on-chain via Ergo Explorer API
 * 4. Backend confirms to merchant that payment is valid
 * 
 * This is "non-custodial" because:
 * - We never hold or control any ERG
 * - We only READ blockchain data to verify payments
 * - Funds go directly from customer wallet to merchant address
 */

import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables from .env file
// Must be called before importing other modules that use process.env
dotenv.config();

import paymentRoutes from './routes/paymentRoutes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

// Initialize Express application
const app: Application = express();

// Get configuration from environment variables
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const CORS_ORIGINS = process.env.CORS_ORIGINS || '*';

/**
 * ===========================================
 * Middleware Configuration
 * ===========================================
 */

// CORS Configuration
// Allows the frontend (running on a different origin) to call this API
const corsOptions: cors.CorsOptions = {
  origin: CORS_ORIGINS === '*' 
    ? '*' 
    : CORS_ORIGINS.split(',').map(origin => origin.trim()),
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

app.use(cors(corsOptions));

// Body Parsing Middleware
// Parses JSON request bodies (like our verification requests)
app.use(express.json({ limit: '10kb' })); // Limit body size for security

// URL-encoded body parsing (for form submissions, if needed)
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Request logging middleware (simple version)
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

/**
 * ===========================================
 * Route Configuration
 * ===========================================
 */

// Root endpoint - basic API info
app.get('/', (_req, res) => {
  res.json({
    name: 'SigmaPay API',
    version: '1.0.0',
    description: 'Non-custodial payment gateway for Ergo Blockchain',
    endpoints: {
      verify: 'POST /api/payments/verify',
      health: 'GET /api/payments/health',
    },
    documentation: 'See README.md for API documentation',
  });
});

// Mount payment routes
app.use('/api/payments', paymentRoutes);

/**
 * ===========================================
 * Error Handling
 * ===========================================
 */

// Handle 404 - Route not found
app.use(notFoundHandler);

// Global error handler - must be last middleware
app.use(errorHandler);

/**
 * ===========================================
 * Server Startup
 * ===========================================
 */

app.listen(PORT, () => {
  console.log('===========================================');
  console.log('       SigmaPay Backend Server');
  console.log('===========================================');
  console.log(`Environment: ${NODE_ENV}`);
  console.log(`Server running on: http://localhost:${PORT}`);
  console.log(`CORS origins: ${CORS_ORIGINS}`);
  console.log(`Min confirmations: ${process.env.MIN_CONFIRMATIONS || 1}`);
  console.log('-------------------------------------------');
  console.log('Available endpoints:');
  console.log(`  GET  http://localhost:${PORT}/`);
  console.log(`  GET  http://localhost:${PORT}/api/payments/health`);
  console.log(`  POST http://localhost:${PORT}/api/payments/verify`);
  console.log('===========================================');
});

// Export app for testing purposes
export default app;
