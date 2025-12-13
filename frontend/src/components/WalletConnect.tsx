/**
 * ===========================================
 * WalletConnect Component
 * ===========================================
 * 
 * A standalone button component for connecting to Nautilus Wallet.
 * Designed to be placed in the header/navbar of the application.
 * 
 * Features:
 * - Auto-checks connection status on mount
 * - Three states: Disconnected, Connected, Error
 * - Dropdown menu for disconnect/copy address
 * - Notifies parent via onWalletChange callback
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Wallet, 
  ChevronDown, 
  Copy, 
  LogOut, 
  ExternalLink,
  AlertCircle,
  Loader,
  Check
} from 'lucide-react';
import {
  getWalletContext,
  disconnectWallet,
  isWalletConnected,
  isNautilusInstalled,
  formatAddress,
  WalletContext,
  WalletError,
} from '../utils/payment';

// ===========================================
// Types
// ===========================================

interface WalletConnectProps {
  /** Callback fired when wallet connection status changes */
  onWalletChange: (address: string | null, context: WalletContext | null) => void;
}

type ConnectionState = 
  | 'disconnected'   // Not connected, show connect button
  | 'connecting'     // Attempting to connect
  | 'connected'      // Successfully connected
  | 'not_installed'; // Nautilus not installed

// ===========================================
// Constants
// ===========================================

const NAUTILUS_DOWNLOAD_URL = 'https://chrome.google.com/webstore/detail/nautilus-wallet/gjlmehlldlphhljhpnlddaodbjjcchai';
const LOCAL_STORAGE_KEY = 'sigmapay_wallet_connected';

// ===========================================
// Component
// ===========================================

export const WalletConnect: React.FC<WalletConnectProps> = ({ onWalletChange }) => {
  // State
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const [walletContext, setWalletContext] = useState<WalletContext | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  // Refs
  const dropdownRef = useRef<HTMLDivElement>(null);

  /**
   * Check if wallet was previously connected (on mount)
   */
  useEffect(() => {
    const checkExistingConnection = async () => {
      // First check if Nautilus is installed
      if (!isNautilusInstalled()) {
        // Don't set error state immediately, just stay disconnected
        return;
      }

      // Check if user was previously connected (from localStorage)
      const wasConnected = localStorage.getItem(LOCAL_STORAGE_KEY) === 'true';
      
      if (wasConnected) {
        try {
          // Verify the connection is still valid
          const isStillConnected = await isWalletConnected();
          
          if (isStillConnected) {
            // Reconnect silently
            const context = await getWalletContext();
            setWalletContext(context);
            setConnectionState('connected');
            onWalletChange(context.address, context);
          } else {
            // Clear stale localStorage
            localStorage.removeItem(LOCAL_STORAGE_KEY);
          }
        } catch {
          // Failed to reconnect, clear localStorage
          localStorage.removeItem(LOCAL_STORAGE_KEY);
        }
      }
    };

    checkExistingConnection();
  }, [onWalletChange]);

  /**
   * Close dropdown when clicking outside
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /**
   * Reset copy success state after delay
   */
  useEffect(() => {
    if (copySuccess) {
      const timer = setTimeout(() => setCopySuccess(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copySuccess]);

  /**
   * Handle wallet connection
   */
  const handleConnect = useCallback(async () => {
    setErrorMessage('');

    // Check if Nautilus is installed
    if (!isNautilusInstalled()) {
      setConnectionState('not_installed');
      return;
    }

    setConnectionState('connecting');

    try {
      const context = await getWalletContext();
      setWalletContext(context);
      setConnectionState('connected');
      
      // Save to localStorage for reconnection
      localStorage.setItem(LOCAL_STORAGE_KEY, 'true');
      
      // Notify parent
      onWalletChange(context.address, context);
    } catch (error) {
      const message = error instanceof WalletError 
        ? error.message 
        : 'Failed to connect wallet';
      setErrorMessage(message);
      setConnectionState('disconnected');
    }
  }, [onWalletChange]);

  /**
   * Handle wallet disconnection
   */
  const handleDisconnect = useCallback(async () => {
    await disconnectWallet();
    setWalletContext(null);
    setConnectionState('disconnected');
    setIsDropdownOpen(false);
    
    // Clear localStorage
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    
    // Notify parent
    onWalletChange(null, null);
  }, [onWalletChange]);

  /**
   * Copy address to clipboard
   */
  const handleCopyAddress = useCallback(async () => {
    if (walletContext?.address) {
      try {
        await navigator.clipboard.writeText(walletContext.address);
        setCopySuccess(true);
      } catch {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = walletContext.address;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopySuccess(true);
      }
    }
  }, [walletContext]);

  /**
   * Open Nautilus download page
   */
  const handleDownloadNautilus = useCallback(() => {
    window.open(NAUTILUS_DOWNLOAD_URL, '_blank', 'noopener,noreferrer');
  }, []);

  // ===========================================
  // Render Functions
  // ===========================================

  /**
   * Disconnected state - Connect button
   */
  const renderDisconnectedButton = () => (
    <button
      onClick={handleConnect}
      className="
        flex items-center gap-2 px-4 py-2.5
        bg-[#ff5e18] hover:bg-orange-700
        text-white font-semibold text-sm
        rounded-lg
        transition-all duration-200
        shadow-lg shadow-orange-500/20
        hover:shadow-orange-500/30
        active:scale-[0.98]
      "
    >
      <Wallet className="w-4 h-4" />
      <span>Connect Wallet</span>
    </button>
  );

  /**
   * Connecting state - Loading button
   */
  const renderConnectingButton = () => (
    <button
      disabled
      className="
        flex items-center gap-2 px-4 py-2.5
        bg-[#ff5e18]/70
        text-white font-semibold text-sm
        rounded-lg
        cursor-wait
      "
    >
      <Loader className="w-4 h-4 animate-spin" />
      <span>Connecting...</span>
    </button>
  );

  /**
   * Connected state - Address pill with dropdown
   */
  const renderConnectedButton = () => (
    <div ref={dropdownRef} className="relative">
      {/* Main Button */}
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="
          flex items-center gap-2 px-3 py-2
          bg-[#242424] hover:bg-[#2a2a2a]
          border border-gray-700 hover:border-gray-600
          text-gray-200
          rounded-lg
          transition-all duration-200
          min-w-[160px]
        "
      >
        {/* Status indicator */}
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        
        {/* Address */}
        <span className="font-mono text-sm">
          {walletContext && formatAddress(walletContext.address, 4)}
        </span>
        
        {/* Balance badge */}
        <span className="text-xs text-gray-400 bg-[#1a1a1a] px-2 py-0.5 rounded">
          {walletContext?.balance} ERG
        </span>
        
        {/* Chevron */}
        <ChevronDown 
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
            isDropdownOpen ? 'rotate-180' : ''
          }`} 
        />
      </button>

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <div 
          className="
            absolute top-full right-0 mt-2
            w-48
            bg-[#1a1a1a] border border-gray-700
            rounded-lg shadow-xl
            overflow-hidden
            z-50
            animate-in fade-in slide-in-from-top-2 duration-200
          "
        >
          {/* Full address display */}
          <div className="px-3 py-2 border-b border-gray-700">
            <p className="text-xs text-gray-500 mb-1">Connected Address</p>
            <p className="text-xs font-mono text-gray-300 break-all">
              {walletContext?.address}
            </p>
          </div>

          {/* Copy Address */}
          <button
            onClick={handleCopyAddress}
            className="
              w-full flex items-center gap-3 px-3 py-2.5
              text-gray-300 hover:bg-[#242424]
              transition-colors duration-150
              text-sm
            "
          >
            {copySuccess ? (
              <>
                <Check className="w-4 h-4 text-green-500" />
                <span className="text-green-500">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy Address</span>
              </>
            )}
          </button>

          {/* View on Explorer */}
          <a
            href={`https://explorer.ergoplatform.com/en/addresses/${walletContext?.address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="
              w-full flex items-center gap-3 px-3 py-2.5
              text-gray-300 hover:bg-[#242424]
              transition-colors duration-150
              text-sm
            "
          >
            <ExternalLink className="w-4 h-4" />
            <span>View on Explorer</span>
          </a>

          {/* Divider */}
          <div className="border-t border-gray-700" />

          {/* Disconnect */}
          <button
            onClick={handleDisconnect}
            className="
              w-full flex items-center gap-3 px-3 py-2.5
              text-red-400 hover:bg-red-500/10
              transition-colors duration-150
              text-sm
            "
          >
            <LogOut className="w-4 h-4" />
            <span>Disconnect</span>
          </button>
        </div>
      )}
    </div>
  );

  /**
   * Not installed state - Install prompt
   */
  const renderNotInstalledButton = () => (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="
          flex items-center gap-2 px-4 py-2.5
          bg-[#242424] hover:bg-[#2a2a2a]
          border border-red-500/50
          text-gray-200 font-semibold text-sm
          rounded-lg
          transition-all duration-200
        "
      >
        <AlertCircle className="w-4 h-4 text-red-400" />
        <span>Wallet Required</span>
        <ChevronDown 
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
            isDropdownOpen ? 'rotate-180' : ''
          }`} 
        />
      </button>

      {/* Dropdown with install instructions */}
      {isDropdownOpen && (
        <div 
          className="
            absolute top-full right-0 mt-2
            w-64
            bg-[#1a1a1a] border border-gray-700
            rounded-lg shadow-xl
            overflow-hidden
            z-50
            animate-in fade-in slide-in-from-top-2 duration-200
          "
        >
          <div className="px-4 py-3 border-b border-gray-700">
            <p className="text-sm font-semibold text-white mb-1">
              Nautilus Wallet Required
            </p>
            <p className="text-xs text-gray-400">
              To make payments, you need to install the Nautilus browser extension.
            </p>
          </div>

          <button
            onClick={handleDownloadNautilus}
            className="
              w-full flex items-center justify-center gap-2 px-4 py-3
              bg-[#ff5e18] hover:bg-orange-700
              text-white font-semibold text-sm
              transition-colors duration-150
            "
          >
            <ExternalLink className="w-4 h-4" />
            <span>Install Nautilus</span>
          </button>

          <button
            onClick={() => {
              setIsDropdownOpen(false);
              setConnectionState('disconnected');
            }}
            className="
              w-full flex items-center justify-center gap-2 px-4 py-2
              text-gray-400 hover:text-gray-300
              text-xs
              transition-colors duration-150
            "
          >
            <span>I already have it installed</span>
          </button>
        </div>
      )}
    </div>
  );

  /**
   * Error toast (shown briefly when connection fails)
   */
  const renderErrorToast = () => {
    if (!errorMessage) return null;

    return (
      <div 
        className="
          absolute top-full right-0 mt-2
          px-4 py-2
          bg-red-500/10 border border-red-500/30
          rounded-lg
          text-red-400 text-sm
          max-w-xs
          animate-in fade-in slide-in-from-top-2 duration-200
        "
      >
        <div className="flex items-start gap-2">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      </div>
    );
  };

  // ===========================================
  // Main Render
  // ===========================================

  return (
    <div className="relative">
      {connectionState === 'disconnected' && renderDisconnectedButton()}
      {connectionState === 'connecting' && renderConnectingButton()}
      {connectionState === 'connected' && renderConnectedButton()}
      {connectionState === 'not_installed' && renderNotInstalledButton()}
      {renderErrorToast()}
    </div>
  );
};

export default WalletConnect;
