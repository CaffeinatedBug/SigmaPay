/**
 * ===========================================
 * Ergo Payment Utilities
 * ===========================================
 * 
 * This module handles wallet interactions for Ergo blockchain payments.
 * Uses the Nautilus Wallet API (EIP-12 dApp connector standard).
 * 
 * For EVM Developers:
 * - Nautilus is like MetaMask for Ergo
 * - Instead of window.ethereum, we use window.ergoConnector
 * - ERG uses UTXO model, but the wallet abstracts this complexity
 */

// Type definitions for the Ergo dApp connector (Nautilus Wallet)
interface ErgoBox {
  boxId: string;
  value: string;
  ergoTree: string;
  assets: Array<{
    tokenId: string;
    amount: string;
  }>;
  creationHeight: number;
  additionalRegisters: Record<string, string>;
}

interface ErgoTx {
  inputs: ErgoBox[];
  outputs: ErgoBox[];
}

interface ErgoAPI {
  get_utxos: (amount?: string, tokenId?: string) => Promise<ErgoBox[] | undefined>;
  get_balance: (tokenId?: string) => Promise<string>;
  get_used_addresses: () => Promise<string[]>;
  get_unused_addresses: () => Promise<string[]>;
  get_change_address: () => Promise<string>;
  sign_tx: (tx: ErgoTx) => Promise<ErgoTx>;
  submit_tx: (tx: ErgoTx) => Promise<string>;
}

interface NautilusConnector {
  connect: () => Promise<boolean>;
  disconnect: () => Promise<boolean>;
  isConnected: () => Promise<boolean>;
  getContext: () => Promise<ErgoAPI>;
}

// Extend window type to include ergoConnector
declare global {
  interface Window {
    ergoConnector?: {
      nautilus?: NautilusConnector;
    };
  }
}

// Constants
const NANOERGS_PER_ERG = 1_000_000_000n; // 1 ERG = 10^9 NanoErgs
const MIN_BOX_VALUE = 1_000_000n; // Minimum value for a box (0.001 ERG)
const TX_FEE = 1_100_000n; // Standard transaction fee (~0.0011 ERG)

/**
 * Wallet context containing the connected wallet API and addresses
 */
export interface WalletContext {
  api: ErgoAPI;
  address: string;
  balance: string;
}

/**
 * Payment result returned after a successful transaction
 */
export interface PaymentResult {
  txId: string;
  amount: string;
  recipient: string;
}

/**
 * Custom error class for wallet-related errors
 */
export class WalletError extends Error {
  code: string;
  
  constructor(message: string, code: string = 'WALLET_ERROR') {
    super(message);
    this.name = 'WalletError';
    this.code = code;
  }
}

/**
 * Checks if Nautilus wallet extension is installed
 */
export function isNautilusInstalled(): boolean {
  return typeof window !== 'undefined' && 
         window.ergoConnector?.nautilus !== undefined;
}

/**
 * Connects to Nautilus wallet and returns the wallet context
 * Similar to connecting MetaMask in EVM world
 * 
 * @returns WalletContext with API access, address, and balance
 * @throws WalletError if connection fails
 */
export async function getWalletContext(): Promise<WalletContext> {
  // Check if Nautilus is installed
  if (!isNautilusInstalled()) {
    throw new WalletError(
      'Nautilus wallet not found. Please install the Nautilus browser extension.',
      'WALLET_NOT_FOUND'
    );
  }

  const nautilus = window.ergoConnector!.nautilus!;

  try {
    // Request connection (user will see a popup)
    const connected = await nautilus.connect();
    
    if (!connected) {
      throw new WalletError(
        'User rejected the connection request.',
        'CONNECTION_REJECTED'
      );
    }

    // Get the wallet API context
    const api = await nautilus.getContext();
    
    // Get the user's addresses and balance
    const addresses = await api.get_used_addresses();
    const address = addresses[0] || (await api.get_unused_addresses())[0];
    const balanceNanoErg = await api.get_balance();
    const balanceErg = (Number(balanceNanoErg) / Number(NANOERGS_PER_ERG)).toFixed(4);

    return {
      api,
      address,
      balance: balanceErg,
    };
  } catch (error) {
    if (error instanceof WalletError) {
      throw error;
    }
    throw new WalletError(
      `Failed to connect to Nautilus: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'CONNECTION_FAILED'
    );
  }
}

/**
 * Disconnects from Nautilus wallet
 */
export async function disconnectWallet(): Promise<void> {
  if (isNautilusInstalled()) {
    try {
      await window.ergoConnector!.nautilus!.disconnect();
    } catch {
      // Ignore disconnect errors
    }
  }
}

/**
 * Checks if wallet is currently connected
 */
export async function isWalletConnected(): Promise<boolean> {
  if (!isNautilusInstalled()) {
    return false;
  }
  
  try {
    return await window.ergoConnector!.nautilus!.isConnected();
  } catch {
    return false;
  }
}

/**
 * Sends an ERG payment to a recipient address
 * 
 * This function:
 * 1. Builds a transaction with the user's UTXOs
 * 2. Creates an output box for the recipient
 * 3. Creates a change box back to the sender
 * 4. Asks the user to sign the transaction
 * 5. Submits the signed transaction to the network
 * 
 * @param api - The Ergo wallet API from getWalletContext()
 * @param recipientAddress - The Ergo address to send to
 * @param amountErg - Amount to send in ERG (not NanoErg)
 * @returns PaymentResult with transaction ID
 * @throws WalletError if payment fails
 */
export async function sendErgoPayment(
  api: ErgoAPI,
  recipientAddress: string,
  amountErg: number
): Promise<PaymentResult> {
  try {
    // Convert ERG to NanoErgs
    const amountNanoErg = BigInt(Math.floor(amountErg * Number(NANOERGS_PER_ERG)));
    
    // Validate amount
    if (amountNanoErg < MIN_BOX_VALUE) {
      throw new WalletError(
        `Amount too small. Minimum is ${Number(MIN_BOX_VALUE) / Number(NANOERGS_PER_ERG)} ERG`,
        'AMOUNT_TOO_SMALL'
      );
    }

    // Calculate total needed (amount + fee)
    const totalNeeded = amountNanoErg + TX_FEE;
    
    // Get UTXOs to cover the payment
    const utxos = await api.get_utxos(totalNeeded.toString());
    
    if (!utxos || utxos.length === 0) {
      throw new WalletError(
        'Insufficient funds or no UTXOs available.',
        'INSUFFICIENT_FUNDS'
      );
    }

    // Calculate total input value
    const inputValue = utxos.reduce(
      (sum, box) => sum + BigInt(box.value),
      0n
    );

    // Calculate change
    const changeValue = inputValue - amountNanoErg - TX_FEE;
    
    if (changeValue < 0n) {
      throw new WalletError(
        'Insufficient funds to cover amount and fees.',
        'INSUFFICIENT_FUNDS'
      );
    }

    // Get change address
    const changeAddress = await api.get_change_address();

    // Get current blockchain height (approximate - Nautilus handles this)
    const currentHeight = 1200000; // This is handled by the wallet

    // Build the unsigned transaction
    // Note: In production, you'd use a proper transaction builder like @fleet-sdk/core
    // This is a simplified representation - Nautilus wallet handles the complexity
    const unsignedTx: ErgoTx = {
      inputs: utxos,
      outputs: [
        // Output to recipient
        {
          boxId: '', // Will be filled by wallet
          value: amountNanoErg.toString(),
          ergoTree: recipientAddress, // Wallet converts address to ergoTree
          assets: [],
          creationHeight: currentHeight,
          additionalRegisters: {},
        },
        // Change output (if any)
        ...(changeValue >= MIN_BOX_VALUE ? [{
          boxId: '',
          value: changeValue.toString(),
          ergoTree: changeAddress,
          assets: [],
          creationHeight: currentHeight,
          additionalRegisters: {},
        }] : []),
      ],
    };

    // Sign the transaction (user will see a popup to approve)
    const signedTx = await api.sign_tx(unsignedTx);
    
    // Submit to the network
    const txId = await api.submit_tx(signedTx);

    return {
      txId,
      amount: amountErg.toString(),
      recipient: recipientAddress,
    };
  } catch (error) {
    // Handle user rejection
    if (error instanceof Error && error.message.includes('rejected')) {
      throw new WalletError(
        'Transaction was rejected by the user.',
        'TX_REJECTED'
      );
    }
    
    if (error instanceof WalletError) {
      throw error;
    }
    
    throw new WalletError(
      `Payment failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'PAYMENT_FAILED'
    );
  }
}

/**
 * Formats an Ergo address for display (truncated)
 * Example: "9f4QF8AD...xyz123"
 */
export function formatAddress(address: string, chars: number = 8): string {
  if (address.length <= chars * 2) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

/**
 * Gets the Ergo Explorer URL for a transaction
 */
export function getExplorerTxUrl(txId: string): string {
  return `https://explorer.ergoplatform.com/en/transactions/${txId}`;
}
