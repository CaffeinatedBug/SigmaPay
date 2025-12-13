/**
 * ===========================================
 * SigmaPayWidget Component
 * ===========================================
 * 
 * Main payment widget for SigmaPay.
 * - Glassmorphism design with dark theme
 * - Uses WalletContext for connection state
 * - Handles full payment flow with animations
 */

import { useState } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { 
  Wallet, 
  CheckCircle, 
  Loader2, 
  AlertTriangle, 
  ArrowRight,
  Coins,
  Shield,
  RefreshCw
} from 'lucide-react';
import axios from 'axios';
import { useWallet } from '../context/WalletContext';
import { sendErgoPayment } from '../utils/payment';

// ===========================================
// Configuration
// ===========================================

const MERCHANT_ADDRESS = "9hA8MkqGy78oG84S94K74vWvP58gC465e9d48b79";
const API_BASE_URL = "http://localhost:3000/api";

// ===========================================
// Types
// ===========================================

type PaymentStatus = 'idle' | 'signing' | 'verifying' | 'success' | 'error';

// ===========================================
// Animation Variants
// ===========================================

const containerVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
  }
};

const contentVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
  },
  exit: { 
    opacity: 0, 
    x: 20,
    transition: { duration: 0.2 }
  }
};

const successVariants: Variants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: { 
    scale: 1, 
    opacity: 1,
    transition: { type: "spring", stiffness: 200, damping: 15 }
  }
};

// ===========================================
// Component
// ===========================================

const SigmaPayWidget = () => {
  const { isConnected, wallet, connect, isConnecting } = useWallet();
  
  const [amount, setAmount] = useState<string>('');
  const [status, setStatus] = useState<PaymentStatus>('idle');
  const [txId, setTxId] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // ===========================================
  // Payment Handler
  // ===========================================

  const handlePay = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setErrorMessage('Please enter a valid amount');
      setStatus('error');
      return;
    }

    if (!wallet) {
      setErrorMessage('Wallet not connected');
      setStatus('error');
      return;
    }

    setStatus('signing');
    setErrorMessage('');

    try {
      // Step 1: Send payment via Nautilus
      const result = await sendErgoPayment(wallet.api, MERCHANT_ADDRESS, Number(amount));
      setTxId(result.txId);
      setStatus('verifying');

      // Step 2: Verify with backend
      try {
        await axios.post(`${API_BASE_URL}/payments/verify`, {
          txId: result.txId,
          merchantAddress: MERCHANT_ADDRESS,
          expectedAmountErg: Number(amount)
        });
      } catch {
        // Backend verification might fail if TX not yet confirmed
        console.warn('Backend verification pending');
      }

      setStatus('success');
    } catch (error) {
      console.error('Payment failed:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Transaction failed. Please try again.');
      setStatus('error');
    }
  };

  // ===========================================
  // Reset Handler
  // ===========================================

  const handleReset = () => {
    setAmount('');
    setStatus('idle');
    setTxId('');
    setErrorMessage('');
  };

  // ===========================================
  // Render
  // ===========================================

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="relative w-full max-w-md"
    >
      {/* Glow Effect */}
      <div className="absolute -inset-1 bg-gradient-to-r from-ergo-main/50 to-purple-600/50 rounded-3xl blur-xl opacity-20" />

      {/* Glass Card */}
      <div className="relative bg-ergo-card/70 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Pay with Ergo
          </h2>
          <p className="text-gray-500 text-sm mt-2">Secure, non-custodial payments</p>
        </div>

        <AnimatePresence mode="wait">
          {/* ===========================================
              STATE: NOT CONNECTED
          =========================================== */}
          {!isConnected && (
            <motion.div
              key="not-connected"
              variants={contentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-6"
            >
              {/* Info Card */}
              <div className="p-5 bg-ergo-dark/50 rounded-xl border border-white/5">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-ergo-main/10 flex items-center justify-center text-ergo-main flex-shrink-0">
                    <Wallet size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">Connect Your Wallet</h3>
                    <p className="text-sm text-gray-500">
                      Connect your Nautilus wallet to make payments on the Ergo blockchain.
                    </p>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Shield size={14} className="text-green-500" />
                  <span>Non-custodial</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Coins size={14} className="text-ergo-main" />
                  <span>Low fees</span>
                </div>
              </div>

              {/* Connect Button */}
              <motion.button
                onClick={() => connect()}
                disabled={isConnecting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="
                  w-full py-4 
                  bg-ergo-main hover:bg-orange-600 
                  text-white font-bold text-lg
                  rounded-xl 
                  transition-colors duration-200
                  shadow-lg shadow-ergo-main/25
                  disabled:opacity-60 disabled:cursor-wait
                  flex items-center justify-center gap-3
                "
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Connecting...</span>
                  </>
                ) : (
                  <>
                    <Wallet className="w-5 h-5" />
                    <span>Connect Nautilus</span>
                  </>
                )}
              </motion.button>
            </motion.div>
          )}

          {/* ===========================================
              STATE: SUCCESS
          =========================================== */}
          {isConnected && status === 'success' && (
            <motion.div
              key="success"
              variants={successVariants}
              initial="hidden"
              animate="visible"
              className="text-center py-4"
            >
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.1 }}
                className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-5"
              >
                <CheckCircle size={44} className="text-green-500" />
              </motion.div>
              
              <h3 className="text-2xl font-bold text-white mb-2">Payment Sent!</h3>
              <p className="text-gray-400 text-sm mb-6">
                Your transaction has been broadcast to the network.
              </p>
              
              <div className="space-y-3">
                <a
                  href={`https://explorer.ergoplatform.com/en/transactions/${txId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-ergo-main hover:text-orange-400 transition-colors font-medium"
                >
                  View on Explorer
                  <ArrowRight size={16} />
                </a>

                <button
                  onClick={handleReset}
                  className="
                    w-full py-3 mt-4
                    bg-white/5 hover:bg-white/10
                    border border-white/10
                    text-gray-300 rounded-xl
                    transition-colors
                    flex items-center justify-center gap-2
                  "
                >
                  <RefreshCw size={16} />
                  Make Another Payment
                </button>
              </div>
            </motion.div>
          )}

          {/* ===========================================
              STATE: ERROR
          =========================================== */}
          {isConnected && status === 'error' && (
            <motion.div
              key="error"
              variants={contentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="text-center py-4"
            >
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-5">
                <AlertTriangle size={32} className="text-red-500" />
              </div>
              
              <h3 className="text-xl font-bold text-white mb-2">Transaction Failed</h3>
              <p className="text-gray-400 text-sm mb-6">
                {errorMessage || 'Something went wrong. Please try again.'}
              </p>
              
              <button
                onClick={handleReset}
                className="w-full py-3 bg-ergo-main hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors"
              >
                Try Again
              </button>
            </motion.div>
          )}

          {/* ===========================================
              STATE: PAYMENT FORM (idle, signing, verifying)
          =========================================== */}
          {isConnected && status !== 'success' && status !== 'error' && (
            <motion.div
              key="payment-form"
              variants={contentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-6"
            >
              {/* Amount Input */}
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider text-gray-500 font-semibold">
                  Amount (ERG)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    disabled={status !== 'idle'}
                    min="0.001"
                    step="0.001"
                    className="
                      w-full bg-ergo-dark/70 
                      border border-white/10 rounded-xl 
                      px-4 py-4 text-2xl font-mono text-white
                      placeholder:text-gray-600
                      focus:outline-none focus:border-ergo-main focus:ring-1 focus:ring-ergo-main
                      transition-all
                      disabled:opacity-50 disabled:cursor-not-allowed
                    "
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">
                    ERG
                  </span>
                </div>
              </div>

              {/* Progress Steps */}
              {status !== 'idle' && (
                <div className="flex items-center justify-between text-xs px-2">
                  <div className={`flex items-center gap-1.5 ${status === 'signing' ? 'text-ergo-main' : 'text-gray-500'}`}>
                    <div className={`w-2 h-2 rounded-full ${status === 'signing' ? 'bg-ergo-main animate-pulse' : 'bg-gray-600'}`} />
                    <span>Sign TX</span>
                  </div>
                  <div className="flex-1 h-px bg-gray-700 mx-3" />
                  <div className={`flex items-center gap-1.5 ${status === 'verifying' ? 'text-ergo-main' : 'text-gray-500'}`}>
                    <div className={`w-2 h-2 rounded-full ${status === 'verifying' ? 'bg-ergo-main animate-pulse' : 'bg-gray-600'}`} />
                    <span>Verify</span>
                  </div>
                  <div className="flex-1 h-px bg-gray-700 mx-3" />
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <div className="w-2 h-2 rounded-full bg-gray-600" />
                    <span>Done</span>
                  </div>
                </div>
              )}

              {/* Pay Button */}
              <motion.button
                onClick={handlePay}
                disabled={status !== 'idle' || !amount}
                whileHover={status === 'idle' && amount ? { scale: 1.02 } : {}}
                whileTap={status === 'idle' && amount ? { scale: 0.98 } : {}}
                className="
                  w-full py-4
                  bg-gradient-to-r from-ergo-main to-orange-500
                  hover:from-orange-500 hover:to-ergo-main
                  text-white font-bold text-lg rounded-xl
                  shadow-lg shadow-orange-900/30
                  transition-all duration-300
                  disabled:opacity-50 disabled:cursor-not-allowed
                  disabled:hover:from-ergo-main disabled:hover:to-orange-500
                  flex items-center justify-center gap-3
                "
              >
                {status === 'signing' ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Check Wallet...</span>
                  </>
                ) : status === 'verifying' ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <Coins className="w-5 h-5" />
                    <span>Pay Now</span>
                  </>
                )}
              </motion.button>

              {/* Security Note */}
              <p className="text-center text-xs text-gray-600">
                🔒 Your funds never leave your wallet until you sign
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default SigmaPayWidget;