/**
 * ===========================================
 * Ergo Explorer API Type Definitions
 * ===========================================
 * 
 * These interfaces define the shape of data returned by the Ergo Explorer API.
 * 
 * For developers familiar with EVM:
 * - Ergo uses a UTXO model (like Bitcoin), not an account model (like Ethereum)
 * - Transactions consume "boxes" (UTXOs) as inputs and create new boxes as outputs
 * - Each box has a value in NanoErgs (like wei in Ethereum, but 1 ERG = 10^9 NanoErgs)
 * - Addresses in Ergo start with "9" (mainnet) or "3" (testnet)
 */

/**
 * Represents an asset (token) contained within a box
 * Similar to ERC-20 tokens in Ethereum, but native to the protocol
 */
export interface ErgoAsset {
  tokenId: string;      // Unique identifier for the token (like contract address in EVM)
  index: number;        // Position of the asset in the box
  amount: number;       // Amount of tokens (raw units, no decimals applied)
  name: string | null;  // Human-readable name (if registered)
  decimals: number;     // Decimal places for display (like ERC-20 decimals)
  type: string;         // Token type (e.g., "EIP-004")
}

/**
 * Represents a transaction input (a box being spent)
 * In UTXO model, inputs are previous outputs being consumed
 */
export interface ErgoTransactionInput {
  boxId: string;              // Unique ID of the box being spent
  value: number;              // Value in NanoErgs contained in this box
  index: number;              // Index of this input in the transaction
  spendingProof: string;      // Cryptographic proof that authorizes spending (like a signature)
  outputBlockId: string;      // Block where this box was originally created
  outputTransactionId: string; // Transaction that created this box
  outputIndex: number;        // Index in the creating transaction's outputs
  ergoTree: string;           // Serialized script guarding the box (like smart contract bytecode)
  address: string;            // Human-readable address derived from ergoTree
  assets: ErgoAsset[];        // Tokens contained in this box
  additionalRegisters: Record<string, string>; // Custom data stored in the box (R4-R9)
}

/**
 * Represents a transaction output (a new box being created)
 * This is the key structure for payment verification:
 * - We check if any output has the merchant's address
 * - We verify the value meets the expected payment amount
 */
export interface ErgoTransactionOutput {
  boxId: string;        // Unique identifier for this new box
  transactionId: string; // ID of the transaction creating this box
  blockId: string;      // ID of the block containing this transaction
  value: number;        // Value in NanoErgs (THIS IS WHAT WE CHECK FOR PAYMENTS)
  index: number;        // Position of this output in the transaction
  globalIndex: number;  // Global index across all blockchain outputs
  creationHeight: number; // Block height when this box was created
  settlementHeight: number; // Block height when this box was confirmed
  ergoTree: string;     // Script guarding this box
  address: string;      // Recipient address (THIS IS WHAT WE MATCH TO MERCHANT)
  assets: ErgoAsset[];  // Tokens being sent to this address
  additionalRegisters: Record<string, string>; // Custom data
  spentTransactionId: string | null; // If spent, which transaction consumed this box
  mainChain: boolean;   // Whether this is on the main chain (not orphaned)
}

/**
 * Complete transaction response from Ergo Explorer API
 * GET /api/v1/transactions/{txId}
 */
export interface ErgoTransaction {
  id: string;                    // Transaction ID (hash)
  blockId: string;               // Block containing this transaction
  inclusionHeight: number;       // Block height where tx was included
  timestamp: number;             // Unix timestamp (milliseconds)
  index: number;                 // Position in the block
  globalIndex: number;           // Global transaction index
  numConfirmations: number;      // Number of blocks built on top (CRITICAL FOR VERIFICATION)
  inputs: ErgoTransactionInput[];  // Boxes being spent
  outputs: ErgoTransactionOutput[]; // Boxes being created (CHECK THESE FOR PAYMENT)
  size: number;                  // Transaction size in bytes
}

/**
 * API error response structure
 */
export interface ErgoApiError {
  status: number;
  reason: string;
}

/**
 * Payment verification request body
 */
export interface PaymentVerificationRequest {
  txId: string;              // Transaction ID to verify
  merchantAddress: string;   // Expected recipient address
  expectedAmountErg: number; // Expected payment amount in ERG (not NanoErg)
}

/**
 * Payment verification response
 */
export interface PaymentVerificationResponse {
  verified: boolean;
  txId: string;
  confirmations: number;
  receivedAmount: string;    // Amount received in ERG (formatted string)
  message: string;
}

/**
 * Custom error class for payment verification failures
 */
export class PaymentVerificationError extends Error {
  public statusCode: number;
  public code: string;

  constructor(message: string, statusCode: number = 400, code: string = 'VERIFICATION_FAILED') {
    super(message);
    this.name = 'PaymentVerificationError';
    this.statusCode = statusCode;
    this.code = code;
  }
}
