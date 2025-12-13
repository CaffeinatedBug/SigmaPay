/**
 * ===========================================
 * Know Your Assumptions (KYA) Modal
 * ===========================================
 * 
 * Legal disclaimer modal required for hackathon compliance.
 * Displays important warnings about using the dApp.
 */

import React, { useEffect } from 'react';
import { X, AlertTriangle, Shield } from 'lucide-react';

// ===========================================
// Types
// ===========================================

interface KYAModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// ===========================================
// Component
// ===========================================

export const KYAModal: React.FC<KYAModalProps> = ({ isOpen, onClose }) => {
  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="kya-title"
        className="
          fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
          w-full max-w-lg mx-4
          bg-[#242424] border border-gray-700
          rounded-xl shadow-2xl
          z-50
          animate-in fade-in zoom-in-95 duration-200
        "
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-orange-500" />
            </div>
            <h2 id="kya-title" className="text-xl font-bold text-white">
              Know Your Assumptions
            </h2>
          </div>
          <button
            onClick={onClose}
            className="
              p-2 rounded-lg
              text-gray-400 hover:text-white
              hover:bg-gray-700
              transition-colors duration-150
            "
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Warning Banner */}
          <div className="flex items-start gap-3 p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg mb-5">
            <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
            <p className="text-orange-200 text-sm">
              Please read and understand the following before using this application.
            </p>
          </div>

          {/* Disclaimer Text */}
          <div className="space-y-4 text-gray-300 text-sm leading-relaxed">
            <p>
              This software is provided <strong className="text-white">"as is"</strong>. 
              It interacts with the Ergo blockchain. Transactions are irreversible.
            </p>
            
            <p>
              The developers are not responsible for funds lost due to user error or network issues.
            </p>

            <p className="text-orange-400 font-medium">
              Always verify the merchant address before confirming any transaction.
            </p>

            <ul className="list-disc list-inside space-y-2 text-gray-400">
              <li>Double-check all addresses before sending</li>
              <li>Start with small test transactions</li>
              <li>Keep your wallet seed phrase secure</li>
              <li>Never share your private keys</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-700">
          <button
            onClick={onClose}
            className="
              w-full py-3 px-4
              bg-orange-600 hover:bg-orange-700
              text-white font-semibold
              rounded-lg
              transition-colors duration-150
            "
          >
            I Understand
          </button>
        </div>
      </div>
    </>
  );
};

export default KYAModal;
