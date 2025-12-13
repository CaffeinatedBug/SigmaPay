/**
 * ===========================================
 * Wallet Context
 * ===========================================
 * 
 * React Context for managing Nautilus Wallet connection state.
 * Provides wallet state and connection methods to all components.
 * 
 * Usage:
 * 1. Wrap your app with <WalletProvider>
 * 2. Use the useWallet() hook in any component
 */

import React, { 
  createContext, 
  useContext, 
  useState, 
  useEffect, 
  useCallback,
  useMemo,
  ReactNode 
} from 'react';
import {
  getWalletContext,
  disconnectWallet,
  isWalletConnected,
  isNautilusInstalled,
  WalletContext as WalletContextType,
  WalletError,
} from '../utils/payment';

// ===========================================
// Types
// ===========================================

interface WalletState {
  /** Whether the wallet is currently connected */
  isConnected: boolean;
  /** Whether a connection attempt is in progress */
  isConnecting: boolean;
  /** The connected wallet's address (null if not connected) */
  address: string | null;
  /** The wallet's ERG balance (null if not connected) */
  balance: string | null;
  /** The full wallet context object (null if not connected) */
  wallet: WalletContextType | null;
  /** Any error that occurred during connection */
  error: string | null;
  /** Whether Nautilus extension is installed */
  isNautilusAvailable: boolean;
}

interface WalletContextValue extends WalletState {
  /** Connect to Nautilus wallet */
  connect: () => Promise<void>;
  /** Disconnect from wallet */
  disconnect: () => Promise<void>;
  /** Clear any error messages */
  clearError: () => void;
}

// ===========================================
// Context
// ===========================================

const WalletContext = createContext<WalletContextValue | undefined>(undefined);

// Local storage key for persisting connection state
const STORAGE_KEY = 'sigmapay_wallet_connected';

// ===========================================
// Provider Component
// ===========================================

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  // State
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [wallet, setWallet] = useState<WalletContextType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isNautilusAvailable, setIsNautilusAvailable] = useState(false);

  /**
   * Check if Nautilus is installed on mount
   */
  useEffect(() => {
    // Small delay to allow extension to inject
    const timer = setTimeout(() => {
      setIsNautilusAvailable(isNautilusInstalled());
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  /**
   * Check for existing connection on mount
   */
  useEffect(() => {
    const checkExistingConnection = async () => {
      // Check if user was previously connected
      const wasConnected = localStorage.getItem(STORAGE_KEY) === 'true';
      
      if (!wasConnected || !isNautilusInstalled()) {
        return;
      }

      try {
        // Verify the connection is still valid
        const stillConnected = await isWalletConnected();
        
        if (stillConnected) {
          // Silently reconnect
          setIsConnecting(true);
          const context = await getWalletContext();
          
          setWallet(context);
          setAddress(context.address);
          setBalance(context.balance);
          setIsConnected(true);
          setError(null);
        } else {
          // Clear stale storage
          localStorage.removeItem(STORAGE_KEY);
        }
      } catch (err) {
        // Failed to reconnect, clear storage
        localStorage.removeItem(STORAGE_KEY);
        console.warn('[WalletContext] Failed to restore connection:', err);
      } finally {
        setIsConnecting(false);
      }
    };

    checkExistingConnection();
  }, []);

  /**
   * Connect to Nautilus wallet
   */
  const connect = useCallback(async () => {
    if (!isNautilusInstalled()) {
      setError('Nautilus wallet not found. Please install the browser extension.');
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const context = await getWalletContext();
      
      setWallet(context);
      setAddress(context.address);
      setBalance(context.balance);
      setIsConnected(true);
      
      // Persist connection state
      localStorage.setItem(STORAGE_KEY, 'true');
      
      console.log('[WalletContext] Connected:', context.address);
    } catch (err) {
      const message = err instanceof WalletError 
        ? err.message 
        : 'Failed to connect wallet';
      setError(message);
      console.error('[WalletContext] Connection error:', err);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  /**
   * Disconnect from wallet
   */
  const disconnect = useCallback(async () => {
    try {
      await disconnectWallet();
    } catch (err) {
      console.warn('[WalletContext] Disconnect error:', err);
    }

    // Reset state
    setWallet(null);
    setAddress(null);
    setBalance(null);
    setIsConnected(false);
    setError(null);
    
    // Clear persisted state
    localStorage.removeItem(STORAGE_KEY);
    
    console.log('[WalletContext] Disconnected');
  }, []);

  /**
   * Clear error message
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo<WalletContextValue>(() => ({
    isConnected,
    isConnecting,
    address,
    balance,
    wallet,
    error,
    isNautilusAvailable,
    connect,
    disconnect,
    clearError,
  }), [
    isConnected,
    isConnecting,
    address,
    balance,
    wallet,
    error,
    isNautilusAvailable,
    connect,
    disconnect,
    clearError,
  ]);

  return (
    <WalletContext.Provider value={contextValue}>
      {children}
    </WalletContext.Provider>
  );
};

// ===========================================
// Hook
// ===========================================

/**
 * Hook to access wallet context
 * 
 * @example
 * const { isConnected, address, connect, disconnect } = useWallet();
 * 
 * @throws Error if used outside of WalletProvider
 */
export function useWallet(): WalletContextValue {
  const context = useContext(WalletContext);
  
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  
  return context;
}

// Export context for advanced use cases
export { WalletContext };
export type { WalletContextValue, WalletState };
