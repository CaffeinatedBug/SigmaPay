/**
 * ===========================================
 * Payment Page
 * ===========================================
 * 
 * Dedicated page for the SigmaPay payment widget.
 * Design inspired by the landing page with consistent theming.
 * 
 * Supports two modes:
 * 1. Intent Mode: Pre-filled payment from merchant (locked fields)
 * 2. Manual Mode: User enters payment details
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Receipt, Wallet, Shield, Lock } from 'lucide-react';
import { Button } from '../components/ui/button';
import WalletConnect from '../components/WalletConnect';
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
      <main className="min-h-screen bg-background relative overflow-hidden">
        {/* Background gradient orbs - matching Home page */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px] animate-pulse-glow" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary/10 rounded-full blur-[100px] animate-pulse-glow" style={{ animationDelay: "1s" }} />
          <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px] animate-pulse-glow" style={{ animationDelay: "2s" }} />
        </div>
        
        {/* Grid pattern overlay - matching Home page */}
        <div 
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
                             linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
            backgroundSize: "60px 60px"
          }}
        />

        {/* Content */}
        <div className="relative z-10 container mx-auto px-6 py-8">
          {/* Header with back button + wallet status (top right) */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-8"
          >
            <Link to="/">
              <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Button>
            </Link>

            <div className="flex items-center gap-3">
              <WalletConnect />
            </div>
          </motion.div>

          {/* Mode Toggle - centered below header */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="flex justify-center mb-6"
          >
            <div className="inline-flex rounded-lg border border-border p-1 bg-secondary/50 backdrop-blur-sm">
              <button
                onClick={() => setUseIntent(true)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${
                  useIntent 
                    ? 'bg-primary text-white shadow-lg shadow-primary/25' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Receipt className="h-4 w-4" />
                Invoice
              </button>
              <button
                onClick={() => setUseIntent(false)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${
                  !useIntent 
                    ? 'bg-primary text-white shadow-lg shadow-primary/25' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Wallet className="h-4 w-4" />
                Manual
              </button>
            </div>
          </motion.div>

          {/* Page Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center mb-10"
          >
            <motion.div 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-secondary/50 backdrop-blur-sm mb-6"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm text-muted-foreground">
                {useIntent ? 'Merchant Invoice' : 'Send Payment'}
              </span>
            </motion.div>
            
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
              <span className="text-foreground">SigmaPay</span>{' '}
              <span className="text-gradient">Checkout</span>
            </h1>
            <p className="text-muted-foreground max-w-md mx-auto">
              {useIntent 
                ? 'Complete your payment securely with your Nautilus wallet'
                : 'Send ERG or SigUSD directly to any Ergo address'
              }
            </p>
          </motion.div>

          {/* Widget Container */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex justify-center"
          >
            <SigmaPayWidget 
              paymentIntent={useIntent ? DEMO_PAYMENT_INTENT : undefined} 
            />
          </motion.div>
          
          {/* Trust indicators - matching Home page */}
          <motion.div 
            className="flex flex-wrap items-center justify-center gap-6 md:gap-8 mt-12 text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-primary" />
              <span className="text-sm">Non-Custodial</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              <span className="text-sm">Secure Signing</span>
            </div>
            <div className="flex items-center gap-2">
              <Wallet className="h-4 w-4 text-primary" />
              <span className="text-sm">Nautilus Wallet</span>
            </div>
          </motion.div>

          {/* Demo Info */}
          <motion.p 
            className="text-center text-xs text-muted-foreground mt-8 p-3 rounded-lg bg-secondary/30 border border-border max-w-md mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {useIntent 
              ? "🧪 Demo Mode: Invoice with locked amount and 5-minute expiry"
              : "🧪 Demo Mode: Manual payment - enter any amount"
            }
          </motion.p>
        </div>

        {/* Footer */}
        <footer className="relative z-10 py-6 border-t border-border mt-auto">
          <div className="container mx-auto px-6 text-center">
            <p className="text-sm text-muted-foreground">
              © 2024 SigmaPay. Built on{' '}
              <a 
                href="https://ergoplatform.org" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Ergo Blockchain
              </a>
            </p>
          </div>
        </footer>
      </main>
    </WalletProvider>
  );
};

export default Payment;
