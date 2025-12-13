/**
 * ===========================================
 * Payment Routes
 * ===========================================
 * 
 * Defines the API routes for payment verification.
 * 
 * Available Endpoints:
 * - POST /api/payments/verify - Verify a payment transaction
 * - GET /api/payments/health - Health check endpoint
 */

import { Router } from 'express';
import { verifyPayment, healthCheck } from '../controllers/paymentController';

const router = Router();

/**
 * POST /api/payments/verify
 * 
 * Verifies that a payment was made to a merchant's address.
 * 
 * Request Body:
 * {
 *   "txId": string,           // The Ergo transaction ID (64 hex chars)
 *   "merchantAddress": string, // The merchant's Ergo address (starts with "9")
 *   "expectedAmountErg": number // Expected payment amount in ERG
 * }
 * 
 * Success Response (200):
 * {
 *   "verified": true,
 *   "txId": string,
 *   "confirmations": number,
 *   "receivedAmount": string,
 *   "message": "Payment verified successfully"
 * }
 * 
 * Error Responses:
 * - 400: Invalid request, wrong recipient, amount too low, insufficient confirmations
 * - 404: Transaction not found
 * - 503: Ergo Explorer API unavailable
 * - 500: Internal server error
 */
router.post('/verify', verifyPayment);

/**
 * GET /api/payments/health
 * 
 * Health check endpoint to verify the service is running.
 * 
 * Response (200):
 * {
 *   "status": "healthy",
 *   "service": "SigmaPay Payment Verification",
 *   "minConfirmations": number,
 *   "timestamp": string
 * }
 */
router.get('/health', healthCheck);

export default router;
