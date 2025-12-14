/**
 * ===========================================
 * Payment Page
 * ===========================================
 * 
 * Dedicated page for the SigmaPay payment widget.
 * 
 * Supports two modes:
 * 1. Intent Mode: Pre-filled payment from merchant (locked fields)
 * 2. Manual Mode: User enters payment details
 */

import { useState } from 'react';
import Layout from '../components/Layout';
import SigmaPayWidget, { type PaymentIntent } from '../components/SigmaPayWidget';
import { WalletProvider } from '../context/WalletContext';

// Demo payment intent - In production, this would come from URL params or API
const DEMO_PAYMENT_INTENT: PaymentIntent = {
  intentId: "SP-10291",
  merchantName: "SigmaPay Demo Store",
  asset: "SigUSD",
  amount: 10,
  recipientAddress: "9hA8MkqGy78oG84S94K74vWvP58gC465e9d48b79",
  expiresAt: Math.floor(Date.now() / 1000) + 300 // Expires in 5 minutes
};

const Payment = () => {
  // Toggle between demo modes
  const [useIntent, setUseIntent] = useState(true);
  
  return (
    <WalletProvider>
      <Layout>
        {/* Mode Toggle (for demo purposes) */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex rounded-lg border border-white/10 p-1 bg-black/30">
            <button
              onClick={() => setUseIntent(true)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                useIntent 
                  ? 'bg-ergo-main text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Invoice Mode
            </button>
            <button
              onClick={() => setUseIntent(false)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                !useIntent 
                  ? 'bg-ergo-main text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Manual Mode
            </button>
          </div>
        </div>
        
        {/* Payment Widget */}
        <SigmaPayWidget 
          paymentIntent={useIntent ? DEMO_PAYMENT_INTENT : undefined} 
        />
        
        {/* Demo Info */}
        <p className="text-center text-xs text-gray-500 mt-6">
          {useIntent 
            ? "Demo: Invoice mode with locked amount and 5-minute expiry"
            : "Demo: Manual mode - enter any amount"
          }
        </p>
      </Layout>
    </WalletProvider>
  );
};

export default Payment;
