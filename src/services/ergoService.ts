/**
 * ===========================================
 * Ergo Blockchain Service
 * ===========================================
 * 
 * This service handles all interactions with the Ergo blockchain via the Explorer API.
 * 
 * Key Concepts for EVM Developers:
 * --------------------------------
 * 1. UTXO vs Account Model:
 *    - Ethereum: Account balances change with each transaction
 *    - Ergo: Transactions consume and create "boxes" (UTXOs)
 *    - To verify a payment, we check if a transaction OUTPUT goes to the merchant
 * 
 * 2. NanoErgs vs Wei:
 *    - Ethereum: 1 ETH = 10^18 Wei
 *    - Ergo: 1 ERG = 10^9 NanoErgs (smaller exponent!)
 * 
 * 3. Confirmations:
 *    - Both work similarly - more blocks = more finality
 *    - Ergo blocks are ~2 minutes (vs Ethereum's ~12 seconds)
 *    - 1 confirmation is usually sufficient for small amounts
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import { ErgoTransaction, ErgoApiError, PaymentVerificationError } from '../types/ergo.types';

// Constants for ERG/NanoErg conversion
const NANOERGS_PER_ERG = 1_000_000_000; // 10^9 NanoErgs = 1 ERG

/**
 * Converts ERG to NanoErgs
 * Similar to converting ETH to Wei, but with 9 decimal places instead of 18
 * 
 * @param erg - Amount in ERG (e.g., 1.5 ERG)
 * @returns Amount in NanoErgs (e.g., 1500000000 NanoErgs)
 * 
 * @example
 * ergToNanoErg(1)    // Returns 1000000000
 * ergToNanoErg(0.5)  // Returns 500000000
 */
export function ergToNanoErg(erg: number): bigint {
  // Using BigInt for precision with large numbers
  // We multiply by NANOERGS_PER_ERG and handle decimals carefully
  const nanoErgs = Math.floor(erg * NANOERGS_PER_ERG);
  return BigInt(nanoErgs);
}

/**
 * Converts NanoErgs to ERG
 * Inverse of ergToNanoErg
 * 
 * @param nanoErg - Amount in NanoErgs
 * @returns Amount in ERG as a string with proper decimal formatting
 */
export function nanoErgToErg(nanoErg: number | bigint): string {
  const nanoErgNum = typeof nanoErg === 'bigint' ? Number(nanoErg) : nanoErg;
  return (nanoErgNum / NANOERGS_PER_ERG).toFixed(9);
}

/**
 * ErgoService Class
 * Handles all Ergo Explorer API interactions
 */
class ErgoService {
  private readonly apiClient: AxiosInstance;
  private readonly baseUrl: string;

  constructor() {
    // Get API URL from environment or use default
    this.baseUrl = process.env.ERGO_EXPLORER_API_URL || 'https://api.ergoplatform.com/api/v1';
    
    // Create axios instance with default configuration
    this.apiClient = axios.create({
      baseURL: this.baseUrl,
      timeout: 30000, // 30 second timeout
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    // Add response interceptor for consistent error handling
    this.apiClient.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ErgoApiError>) => {
        return Promise.reject(this.handleApiError(error));
      }
    );
  }

  /**
   * Transforms axios errors into meaningful PaymentVerificationErrors
   */
  private handleApiError(error: AxiosError<ErgoApiError>): PaymentVerificationError {
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 404:
          return new PaymentVerificationError(
            'Transaction not found. It may not exist or hasn\'t been indexed yet.',
            404,
            'TX_NOT_FOUND'
          );
        case 429:
          return new PaymentVerificationError(
            'Rate limit exceeded. Please try again later.',
            429,
            'RATE_LIMITED'
          );
        case 500:
        case 502:
        case 503:
          return new PaymentVerificationError(
            'Ergo Explorer API is temporarily unavailable.',
            503,
            'API_UNAVAILABLE'
          );
        default:
          return new PaymentVerificationError(
            data?.reason || `API request failed with status ${status}`,
            status,
            'API_ERROR'
          );
      }
    } else if (error.code === 'ECONNABORTED') {
      return new PaymentVerificationError(
        'Request to Ergo Explorer timed out.',
        504,
        'TIMEOUT'
      );
    } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      return new PaymentVerificationError(
        'Unable to connect to Ergo Explorer API.',
        503,
        'CONNECTION_ERROR'
      );
    }
    
    return new PaymentVerificationError(
      'An unexpected error occurred while fetching transaction data.',
      500,
      'UNKNOWN_ERROR'
    );
  }

  /**
   * Fetches a transaction by its ID from the Ergo Explorer API
   * 
   * @param txId - The transaction ID (hash) to fetch
   * @returns The full transaction data including inputs, outputs, and confirmation count
   * 
   * @throws PaymentVerificationError if the transaction is not found or API fails
   * 
   * @example
   * const tx = await ergoService.getTransaction('abc123...');
   * console.log(tx.numConfirmations); // Number of confirmations
   * console.log(tx.outputs);          // Array of output boxes
   */
  async getTransaction(txId: string): Promise<ErgoTransaction> {
    // Validate txId format (Ergo tx IDs are 64 hex characters)
    if (!this.isValidTxId(txId)) {
      throw new PaymentVerificationError(
        'Invalid transaction ID format. Must be a 64-character hex string.',
        400,
        'INVALID_TX_ID'
      );
    }

    console.log(`[ErgoService] Fetching transaction: ${txId}`);
    
    const response = await this.apiClient.get<ErgoTransaction>(`/transactions/${txId}`);
    
    console.log(`[ErgoService] Transaction found with ${response.data.numConfirmations} confirmations`);
    
    return response.data;
  }

  /**
   * Validates that a string is a valid Ergo transaction ID
   * Transaction IDs in Ergo are 64-character hexadecimal strings (32 bytes)
   */
  private isValidTxId(txId: string): boolean {
    return /^[a-fA-F0-9]{64}$/.test(txId);
  }

  /**
   * Validates that a string looks like a valid Ergo address
   * Mainnet addresses start with "9", testnet with "3"
   * This is a basic validation - full validation requires cryptographic checks
   */
  isValidAddress(address: string): boolean {
    // Ergo addresses are base58 encoded and typically 51-52 characters
    // Mainnet P2PK addresses start with "9"
    // This is a simplified check - production should use proper address validation
    const ergoAddressPattern = /^[1-9A-HJ-NP-Za-km-z]{40,60}$/;
    return ergoAddressPattern.test(address) && (address.startsWith('9') || address.startsWith('3'));
  }

  /**
   * Gets the current network height (latest block number)
   * Useful for calculating confirmations manually if needed
   */
  async getNetworkHeight(): Promise<number> {
    const response = await this.apiClient.get<{ height: number }>('/blocks?limit=1&sortBy=height&sortDirection=desc');
    return response.data.height;
  }
}

// Export a singleton instance
export const ergoService = new ErgoService();

// Also export the class for testing purposes
export { ErgoService };
