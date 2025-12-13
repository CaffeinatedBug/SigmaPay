/**
 * ===========================================
 * WalletConnect Component
 * ===========================================
 * 
 * Simple wallet connection button using WalletContext.
 * - Disconnected: Orange "Connect Wallet" button
 * - Connected: Dark pill with truncated address
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, Copy, LogOut, ExternalLink, Check, ChevronDown } from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { formatAddress } from '../utils/payment';

export const WalletConnect: React.FC = () => {
  const { isConnected, isConnecting, address, connect, disconnect } = useWallet();
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset copy success
  useEffect(() => {
    if (copySuccess) {
      const timer = setTimeout(() => setCopySuccess(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copySuccess]);

  const handleCopy = useCallback(async () => {
    if (address) {
      await navigator.clipboard.writeText(address);
      setCopySuccess(true);
    }
  }, [address]);

  // ===========================================
  // DISCONNECTED: Orange "Connect Wallet" button
  // ===========================================
  if (!isConnected) {
    return (
      <motion.button
        onClick={() => connect()}
        disabled={isConnecting}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className="
          flex items-center gap-2 px-5 py-2.5
          bg-ergo-main hover:bg-orange-600
          text-white font-semibold text-sm
          rounded-full
          transition-colors duration-200
          shadow-lg shadow-ergo-main/25
          disabled:opacity-60 disabled:cursor-wait
        "
      >
        <Wallet className="w-4 h-4" />
        <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
      </motion.button>
    );
  }

  // ===========================================
  // CONNECTED: Dark pill with truncated address
  // ===========================================
  return (
    <div ref={dropdownRef} className="relative">
      <motion.button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="
          flex items-center gap-2 px-4 py-2
          bg-ergo-card/80 hover:bg-ergo-card
          border border-ergo-border
          text-gray-200
          rounded-full
          transition-all duration-200
        "
      >
        <div className="w-2 h-2 bg-green-500 rounded-full" />
        <span className="font-mono text-sm">
          {formatAddress(address!, 4)}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isDropdownOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="
              absolute top-full right-0 mt-2 w-52
              bg-ergo-card border border-ergo-border
              rounded-xl shadow-2xl overflow-hidden z-50
            "
          >
            {/* Full Address */}
            <div className="px-4 py-3 border-b border-ergo-border">
              <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Address</p>
              <p className="text-xs font-mono text-gray-300 break-all">{address}</p>
            </div>

            {/* Copy */}
            <button onClick={handleCopy} className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-300 hover:bg-ergo-dark/50 transition-colors text-sm">
              {copySuccess ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              <span>{copySuccess ? 'Copied!' : 'Copy Address'}</span>
            </button>

            {/* Explorer */}
            <a
              href={`https://explorer.ergoplatform.com/en/addresses/${address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-300 hover:bg-ergo-dark/50 transition-colors text-sm"
            >
              <ExternalLink className="w-4 h-4" />
              <span>View on Explorer</span>
            </a>

            <div className="border-t border-ergo-border" />

            {/* Disconnect */}
            <button
              onClick={() => { disconnect(); setIsDropdownOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-red-400 hover:bg-red-500/10 transition-colors text-sm"
            >
              <LogOut className="w-4 h-4" />
              <span>Disconnect</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WalletConnect;
