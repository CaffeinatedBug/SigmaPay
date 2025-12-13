/**
 * ===========================================
 * Payment Verification Controller
 * ===========================================
 * 
 * This controller handles the core payment verification logic for SigmaPay.
 * 
 * The Verification Flow (for EVM developers):
 * -------------------------------------------
 * In Ethereum, you might check: "Did address X receive Y ETH in transaction Z?"
 * This typically involves checking the `to` field and `value` of a transaction.
 * 
 * In Ergo's UTXO model, it's different:
 * 1. A transaction has multiple OUTPUTS (new boxes being created)
 * 2. Each output has an ADDRESS (recipient) and VALUE (amount in NanoErgs)
 * 3. To verify payment: Loop through outputs, find one where:
 *    - address === merchantAddress
 *    - value >= expectedAmount
 * 
 * Why loop through outputs?
 * - A single Ergo transaction can pay multiple recipients
 * - Change goes back to sender as another output
 * - There might be fee outputs, contract outputs, etc.
 * 
 * Example transaction structure:
 * {
 *   inputs: [{ value: 10 ERG, address: "sender..." }],
 *   outputs: [
 *     { value: 2 ERG, address: "merchant..." },  // <-- Payment to merchant
 *     { value: 7.999 ERG, address: "sender..." }, // <-- Change back to sender
 *     { value: 0.001 ERG, address: "miner..." }   // <-- Mining fee
 *   ]
 * }
 */

import { Request, Response, NextFunction } from 'express';
import { ergoService, ergToNanoErg, nanoErgToErg } from '../services/ergoService';
import {
  PaymentVerificationRequest,
  PaymentVerificationResponse,
  PaymentVerificationError,
  ErgoTransaction,
  ErgoTransactionOutput,
} from '../types/ergo.types';

// Get minimum confirmations from environment (default: 1)
const MIN_CONFIRMATIONS = parseInt(process.env.MIN_CONFIRMATIONS || '1', 10);

/**
 * Validates the request body for payment verification
 * 
 * @throws PaymentVerificationError if validation fails
 */
function validateVerificationRequest(body: unknown): PaymentVerificationRequest {
  const { txId, merchantAddress, expectedAmountErg } = body as PaymentVerificationRequest;

  // Validate txId
  if (!txId || typeof txId !== 'string') {
    throw new PaymentVerificationError(
      'Missing or invalid txId. Must be a string.',
      400,
      'INVALID_REQUEST'
    );
  }

  // Validate merchantAddress
  if (!merchantAddress || typeof merchantAddress !== 'string') {
    throw new PaymentVerificationError(
      'Missing or invalid merchantAddress. Must be a string.',
      400,
      'INVALID_REQUEST'
    );
  }

  // Basic address format validation
  if (!ergoService.isValidAddress(merchantAddress)) {
    throw new PaymentVerificationError(
      'Invalid Ergo address format. Mainnet addresses start with "9".',
      400,
      'INVALID_ADDRESS'
    );
  }

  // Validate expectedAmountErg
  if (expectedAmountErg === undefined || typeof expectedAmountErg !== 'number') {
    throw new PaymentVerificationError(
      'Missing or invalid expectedAmountErg. Must be a number.',
      400,
      'INVALID_REQUEST'
    );
  }

  if (expectedAmountErg <= 0) {
    throw new PaymentVerificationError(
      'expectedAmountErg must be greater than 0.',
      400,
      'INVALID_AMOUNT'
    );
  }

  return { txId, merchantAddress, expectedAmountErg };
}

/**
 * Finds the payment output in a transaction that matches the merchant address
 * 
 * @param outputs - Array of transaction outputs to search
 * @param merchantAddress - The address to find
 * @returns The matching output or undefined if not found
 */
function findMerchantOutput(
  outputs: ErgoTransactionOutput[],
  merchantAddress: string
): ErgoTransactionOutput | undefined {
  /**
   * Loop through all outputs to find one matching the merchant's address.
   * 
   * Why case-sensitive comparison?
   * - Ergo addresses are case-sensitive (base58 encoding)
   * - Unlike Ethereum where addresses are hex and case-insensitive
   * 
   * Why might there be multiple outputs to the same address?
   * - Unlikely in payment scenarios, but possible in batch transactions
   * - We return the first match; could be enhanced to sum all matching outputs
   */
  return outputs.find((output) => output.address === merchantAddress);
}

/**
 * Main payment verification function
 * 
 * This is the core endpoint that merchants call to verify a customer's payment.
 * 
 * @param req - Express request with body containing txId, merchantAddress, expectedAmountErg
 * @param res - Express response
 * @param next - Express next function for error handling
 * 
 * @example Request body:
 * {
 *   "txId": "abc123...def456",
 *   "merchantAddress": "9f4QF8AD1nQ3nJahQVkM...",
 *   "expectedAmountErg": 1.5
 * }
 * 
 * @example Success response:
 * {
 *   "verified": true,
 *   "txId": "abc123...def456",
 *   "confirmations": 3,
 *   "receivedAmount": "1.500000000",
 *   "message": "Payment verified successfully"
 * }
 */
export async function verifyPayment(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    console.log('[PaymentController] Received verification request:', req.body);

    // Step 1: Validate the incoming request
    const { txId, merchantAddress, expectedAmountErg } = validateVerificationRequest(req.body);

    // Step 2: Convert expected amount to NanoErgs for comparison
    // This is like converting ETH to Wei before comparing values
    const expectedAmountNanoErg = ergToNanoErg(expectedAmountErg);
    console.log(`[PaymentController] Expected amount: ${expectedAmountErg} ERG = ${expectedAmountNanoErg} NanoErg`);

    // Step 3: Fetch the transaction from Ergo Explorer
    // This is equivalent to eth_getTransactionByHash + eth_getTransactionReceipt combined
    const transaction: ErgoTransaction = await ergoService.getTransaction(txId);

    // Step 4: Check confirmation count
    // In both Ergo and Ethereum, more confirmations = more finality
    // Unlike Ethereum's probabilistic finality, Ergo uses Autolykos PoW
    if (transaction.numConfirmations < MIN_CONFIRMATIONS) {
      throw new PaymentVerificationError(
        `Insufficient confirmations. Required: ${MIN_CONFIRMATIONS}, Current: ${transaction.numConfirmations}. Please wait for more blocks.`,
        400,
        'INSUFFICIENT_CONFIRMATIONS'
      );
    }

    console.log(`[PaymentController] Transaction has ${transaction.numConfirmations} confirmations (min: ${MIN_CONFIRMATIONS})`);

    // Step 5: Find the output that pays to the merchant
    // In EVM, you'd check tx.to === merchantAddress
    // In UTXO, we check if ANY output.address === merchantAddress
    const merchantOutput = findMerchantOutput(transaction.outputs, merchantAddress);

    if (!merchantOutput) {
      // No output found for the merchant - wrong recipient!
      throw new PaymentVerificationError(
        `No payment found to merchant address ${merchantAddress}. The transaction may have been sent to a different address.`,
        400,
        'WRONG_RECIPIENT'
      );
    }

    console.log(`[PaymentController] Found merchant output: ${merchantOutput.value} NanoErg to ${merchantOutput.address}`);

    // Step 6: Verify the payment amount
    // Compare the actual value sent with the expected amount
    const actualAmountNanoErg = BigInt(merchantOutput.value);

    if (actualAmountNanoErg < expectedAmountNanoErg) {
      // Payment found but amount is less than expected
      const actualAmountErg = nanoErgToErg(merchantOutput.value);
      throw new PaymentVerificationError(
        `Payment amount too low. Expected: ${expectedAmountErg} ERG, Received: ${actualAmountErg} ERG`,
        400,
        'AMOUNT_TOO_LOW'
      );
    }

    // Step 7: Payment verified successfully!
    const response: PaymentVerificationResponse = {
      verified: true,
      txId: txId,
      confirmations: transaction.numConfirmations,
      receivedAmount: nanoErgToErg(merchantOutput.value),
      message: 'Payment verified successfully',
    };

    console.log('[PaymentController] Payment verified successfully:', response);

    res.status(200).json(response);
  } catch (error) {
    // Pass errors to the error handling middleware
    next(error);
  }
}

/**
 * Health check endpoint for the payment service
 */
export async function healthCheck(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Quick check that we can reach the Ergo Explorer API
    // You could add a lightweight API call here to verify connectivity
    res.status(200).json({
      status: 'healthy',
      service: 'SigmaPay Payment Verification',
      minConfirmations: MIN_CONFIRMATIONS,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
}
