/**
 * ===========================================
 * SigmaPay Widget Component
 * ===========================================
 * 
 * A payment widget for accepting ERG payments on the Ergo blockchain.
 * Inspired by the Ergo Platform design language with orange accents.
 * 
 * Flow:
 * 1. Connect Nautilus Wallet
 * 2. Enter payment amount
 * 3. Sign transaction
 * 4. Backend verifies on-chain
 * 5. Show success/error state
 */

import React, { useState, useCallback, useEffect } from 'react';
import { Wallet, CheckCircle, Loader, AlertTriangle, ExternalLink, X, Zap } from 'lucide-react';
import {
  getWalletContext,
  sendErgoPayment,
  isWalletConnected,
  formatAddress,
  getExplorerTxUrl,
  WalletContext,
  WalletError,
} from '../utils/payment';

// ===========================================
// Configuration
// ===========================================

/**
 * Merchant's Ergo address - replace with your actual address
 * Mainnet addresses start with "9"
 */
const MERCHANT_ADDRESS = '9f4QF8AD1nQ3nJahQVkMHYzKKXcQpYYqVsJkZqFBpwRvzgvdMTz';

/**
 * Backend API endpoint for payment verification
 */
const VERIFY_API_URL = 'http://localhost:3000/api/payments/verify';

/**
 * Minimum payment amount in ERG
 */
const MIN_PAYMENT_ERG = 0.001;

// ===========================================
// Types
// ===========================================

type PaymentState = 
  | 'idle'              // Initial state, ready to connect
  | 'connecting_wallet' // Waiting for wallet connection
  | 'ready'            // Wallet connected, ready to pay
  | 'signing'          // Waiting for user to sign transaction
  | 'verifying_backend' // Transaction sent, verifying on backend
  | 'success'          // Payment verified successfully
  | 'error';           // Something went wrong

interface VerificationResponse {
  verified: boolean;
  txId: string;
  confirmations: number;
  receivedAmount: string;
  message: string;
}

interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

// ===========================================
// Props Interface
// ===========================================

interface SigmaPayWidgetProps {
  /** External wallet context from WalletConnect component */
  externalWalletContext?: WalletContext | null;
}

// ===========================================
// Component
// ===========================================

export const SigmaPayWidget: React.FC<SigmaPayWidgetProps> = ({ externalWalletContext }) => {
  // State management
  const [state, setState] = useState<PaymentState>('idle');
  const [walletContext, setWalletContext] = useState<WalletContext | null>(null);
  const [amount, setAmount] = useState<string>('');
  const [txId, setTxId] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [verificationResult, setVerificationResult] = useState<VerificationResponse | null>(null);

  // Sync with external wallet context from WalletConnect component
  useEffect(() => {
    if (externalWalletContext) {
      setWalletContext(externalWalletContext);
      // Only switch to ready if we're in idle or connecting state
      if (state === 'idle' || state === 'connecting_wallet') {
        setState('ready');
      }
    } else if (externalWalletContext === null) {
      // Wallet was disconnected externally
      setWalletContext(null);
      // Only reset to idle if we're not in a transaction flow
      if (state !== 'signing' && state !== 'verifying_backend') {
        setAmount('');
        setTxId('');
        setVerificationResult(null);
        setErrorMessage('');
        setState('idle');
      }
    }
  }, [externalWalletContext, state]);

  // Check wallet connection on mount (fallback if no external context provided)
  useEffect(() => {
    // Skip if external context is being managed
    if (externalWalletContext !== undefined) return;

    const checkConnection = async () => {
      if (await isWalletConnected()) {
        try {
          const context = await getWalletContext();
          setWalletContext(context);
          setState('ready');
        } catch {
          // Wallet was connected but context failed
          setState('idle');
        }
      }
    };
    checkConnection();
  }, [externalWalletContext]);

  /**
   * Verifies the transaction with the backend
   */
  const verifyWithBackend = useCallback(async (transactionId: string, amountErg: number): Promise<VerificationResponse> => {
    const response = await fetch(VERIFY_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        txId: transactionId,
        merchantAddress: MERCHANT_ADDRESS,
        expectedAmountErg: amountErg,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorData = data as ErrorResponse;
      throw new Error(errorData.error?.message || 'Verification failed');
    }

    return data as VerificationResponse;
  }, []);

  /**
   * Handles the payment flow
   */
  const handlePayment = useCallback(async () => {
    if (!walletContext) {
      setErrorMessage('Wallet not connected');
      setState('error');
      return;
    }

    const amountErg = parseFloat(amount);
    
    if (isNaN(amountErg) || amountErg < MIN_PAYMENT_ERG) {
      setErrorMessage(`Please enter a valid amount (minimum ${MIN_PAYMENT_ERG} ERG)`);
      setState('error');
      return;
    }

    setErrorMessage('');
    setState('signing');

    try {
      // Step 1: Send the payment (user signs in wallet)
      const result = await sendErgoPayment(
        walletContext.api,
        MERCHANT_ADDRESS,
        amountErg
      );

      setTxId(result.txId);
      setState('verifying_backend');

      // Step 2: Verify with backend
      // Add a small delay to allow transaction to propagate
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Retry verification a few times (transaction might need time to be indexed)
      let verification: VerificationResponse | null = null;
      let attempts = 0;
      const maxAttempts = 5;

      while (attempts < maxAttempts) {
        try {
          verification = await verifyWithBackend(result.txId, amountErg);
          if (verification.verified) break;
        } catch (error) {
          // If it's not a "not found" error, throw immediately
          if (error instanceof Error && !error.message.includes('not found')) {
            throw error;
          }
        }
        attempts++;
        if (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3s between retries
        }
      }

      if (!verification?.verified) {
        throw new Error('Transaction could not be verified. It may need more confirmations.');
      }

      setVerificationResult(verification);
      setState('success');
    } catch (error) {
      const message = error instanceof WalletError 
        ? error.message 
        : error instanceof Error 
          ? error.message 
          : 'Payment failed';
      setErrorMessage(message);
      setState('error');
    }
  }, [walletContext, amount, verifyWithBackend]);

  /**
   * Resets the widget to try again
   */
  const handleReset = useCallback(() => {
    setAmount('');
    setTxId('');
    setVerificationResult(null);
    setErrorMessage('');
    setState(walletContext ? 'ready' : 'idle');
  }, [walletContext]);

  // ===========================================
  // Render Functions
  // ===========================================

  const renderIdleState = () => (
    <div className="text-center">
      <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Wallet className="w-8 h-8 text-orange-600" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Connect Your Wallet
      </h3>
      <p className="text-gray-500 text-sm mb-6">
        Use the <span className="font-semibold text-orange-600">Connect Wallet</span> button in the top right to get started
      </p>
      <div className="flex items-center justify-center gap-2 text-gray-400">
        <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse" />
        <span className="text-sm">Waiting for wallet connection...</span>
      </div>
      <p className="text-gray-400 text-xs mt-6">
        Don't have Nautilus?{' '}
        <a 
          href="https://chrome.google.com/webstore/detail/nautilus-wallet/gjlmehlldlphhljhpnlddaodbjjcchai" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-orange-600 hover:text-orange-700 underline"
        >
          Install the extension
        </a>
      </p>
    </div>
  );

  const renderConnectingState = () => (
    <div className="text-center py-8">
      <Loader className="w-12 h-12 text-orange-600 animate-spin mx-auto mb-4" />
      <p className="text-gray-600">Connecting to wallet...</p>
      <p className="text-gray-400 text-sm mt-2">
        Please approve the connection in Nautilus
      </p>
    </div>
  );

  const renderReadyState = () => (
    <div>
      {/* Connected wallet info */}
      <div className="bg-gray-50 rounded-lg p-3 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-4 h-4 text-green-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Connected</p>
            <p className="text-sm font-mono text-gray-700">
              {walletContext && formatAddress(walletContext.address)}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">Balance</p>
          <p className="text-sm font-semibold text-gray-900">
            {walletContext?.balance} ERG
          </p>
        </div>
      </div>

      {/* Amount input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Payment Amount
        </label>
        <div className="relative">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            min={MIN_PAYMENT_ERG}
            step="0.001"
            className="w-full px-4 py-3 pr-16 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-lg font-mono"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
            ERG
          </span>
        </div>
      </div>

      {/* Recipient info */}
      <div className="bg-gray-50 rounded-lg p-3 mb-6">
        <p className="text-xs text-gray-500 mb-1">Paying to</p>
        <p className="text-sm font-mono text-gray-700 break-all">
          {formatAddress(MERCHANT_ADDRESS, 12)}
        </p>
      </div>

      {/* Pay button */}
      <button
        onClick={handlePayment}
        disabled={!amount || parseFloat(amount) < MIN_PAYMENT_ERG}
        className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
      >
        <Zap className="w-5 h-5" />
        Pay with Ergo
      </button>
    </div>
  );

  const renderSigningState = () => (
    <div className="text-center py-8">
      <Loader className="w-12 h-12 text-orange-600 animate-spin mx-auto mb-4" />
      <p className="text-gray-900 font-semibold mb-2">Waiting for signature...</p>
      <p className="text-gray-500 text-sm">
        Please confirm the transaction in your Nautilus wallet
      </p>
    </div>
  );

  const renderVerifyingState = () => (
    <div className="text-center py-8">
      <Loader className="w-12 h-12 text-orange-600 animate-spin mx-auto mb-4" />
      <p className="text-gray-900 font-semibold mb-2">Verifying payment...</p>
      <p className="text-gray-500 text-sm mb-4">
        Transaction submitted! Confirming on the blockchain...
      </p>
      {txId && (
        <a
          href={getExplorerTxUrl(txId)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-orange-600 hover:text-orange-700 text-sm"
        >
          View on Explorer
          <ExternalLink className="w-4 h-4" />
        </a>
      )}
    </div>
  );

  const renderSuccessState = () => (
    <div className="text-center">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <CheckCircle className="w-10 h-10 text-green-600" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">
        Payment Successful!
      </h3>
      <p className="text-gray-500 mb-6">
        Your payment has been verified on the blockchain
      </p>

      {/* Transaction details */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-500 text-sm">Amount</span>
            <span className="font-semibold text-gray-900">
              {verificationResult?.receivedAmount} ERG
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 text-sm">Confirmations</span>
            <span className="font-semibold text-green-600">
              {verificationResult?.confirmations}
            </span>
          </div>
          <div className="flex justify-between items-start">
            <span className="text-gray-500 text-sm">Transaction ID</span>
            <span className="font-mono text-xs text-gray-700 text-right max-w-[180px] break-all">
              {txId && formatAddress(txId, 10)}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <a
          href={getExplorerTxUrl(txId)}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
        >
          View on Ergo Explorer
          <ExternalLink className="w-4 h-4" />
        </a>
        <button
          onClick={handleReset}
          className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
        >
          Make Another Payment
        </button>
      </div>
    </div>
  );

  const renderErrorState = () => (
    <div className="text-center">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <AlertTriangle className="w-10 h-10 text-red-600" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">
        Payment Failed
      </h3>
      <p className="text-red-600 mb-6 text-sm">
        {errorMessage}
      </p>

      {/* Show tx link if we have one */}
      {txId && (
        <div className="bg-gray-50 rounded-lg p-3 mb-4">
          <p className="text-xs text-gray-500 mb-1">Transaction ID</p>
          <a
            href={getExplorerTxUrl(txId)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-orange-600 hover:text-orange-700 font-mono break-all flex items-center justify-center gap-1"
          >
            {formatAddress(txId, 12)}
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}

      <button
        onClick={handleReset}
        className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
      >
        Try Again
      </button>
    </div>
  );

  // Render based on current state
  const renderContent = () => {
    switch (state) {
      case 'idle':
        return renderIdleState();
      case 'connecting_wallet':
        return renderConnectingState();
      case 'ready':
        return renderReadyState();
      case 'signing':
        return renderSigningState();
      case 'verifying_backend':
        return renderVerifyingState();
      case 'success':
        return renderSuccessState();
      case 'error':
        return renderErrorState();
      default:
        return renderIdleState();
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Main Card */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-orange-500 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-white font-bold text-lg">SigmaPay</h2>
                <p className="text-orange-100 text-xs">Powered by Ergo</p>
              </div>
            </div>
            {state !== 'idle' && state !== 'connecting_wallet' && state !== 'success' && (
              <button
                onClick={handleReset}
                className="text-white/70 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {renderContent()}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
          <p className="text-center text-xs text-gray-400">
            Secure, non-custodial payments on{' '}
            <a 
              href="https://ergoplatform.org" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-orange-600 hover:text-orange-700"
            >
              Ergo Blockchain
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SigmaPayWidget;
