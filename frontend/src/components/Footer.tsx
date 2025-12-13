/**
 * ===========================================
 * Footer Component
 * ===========================================
 * 
 * Site footer with legal links, social media, and share functionality.
 * Includes KYA modal trigger as required for hackathon compliance.
 */

import React, { useState, useCallback } from 'react';
import { 
  MessageCircle, // Telegram-like
  Github, 
  Share2,
  Check,
  Shield,
  ExternalLink,
  Zap
} from 'lucide-react';
import KYAModal from './KYAModal';

// ===========================================
// Constants
// ===========================================

const SOCIAL_LINKS = {
  telegram: 'https://t.me/ErgoSocials',
  discord: 'https://discord.gg/ergo-platform-668903786361651200',
  github: 'https://github.com/TheStableOrder',
};

// Discord icon as SVG since lucide doesn't have it
const DiscordIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
    aria-hidden="true"
  >
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
  </svg>
);

// ===========================================
// Component
// ===========================================

export const Footer: React.FC = () => {
  const [isKYAOpen, setIsKYAOpen] = useState(false);
  const [showCopiedToast, setShowCopiedToast] = useState(false);

  /**
   * Copy current URL to clipboard
   */
  const handleShare = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShowCopiedToast(true);
      setTimeout(() => setShowCopiedToast(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = window.location.href;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setShowCopiedToast(true);
      setTimeout(() => setShowCopiedToast(false), 2000);
    }
  }, []);

  return (
    <>
      <footer className="relative z-10 border-t border-gray-800/50 bg-gray-900/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main Footer Content */}
          <div className="py-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              
              {/* Left: Logo & Copyright */}
              <div className="flex flex-col items-center md:items-start gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                    <Zap className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-white font-bold">SigmaPay</span>
                </div>
                <p className="text-gray-500 text-sm">
                  © 2025 The Stable Order
                </p>
              </div>

              {/* Center: Links */}
              <div className="flex items-center gap-6">
                {/* KYA Link */}
                <button
                  onClick={() => setIsKYAOpen(true)}
                  className="
                    flex items-center gap-2
                    text-gray-400 hover:text-orange-500
                    text-sm font-medium
                    transition-colors duration-150
                  "
                >
                  <Shield className="w-4 h-4" />
                  <span>Know Your Assumptions (KYA)</span>
                </button>

                {/* Ergo Platform Link */}
                <a
                  href="https://ergoplatform.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="
                    flex items-center gap-1
                    text-gray-400 hover:text-orange-500
                    text-sm
                    transition-colors duration-150
                  "
                >
                  <span>Built on Ergo</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Right: Social Links & Share */}
              <div className="flex items-center gap-3">
                {/* Social Icons */}
                <div className="flex items-center gap-1">
                  {/* Telegram */}
                  <a
                    href={SOCIAL_LINKS.telegram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="
                      p-2 rounded-lg
                      text-gray-400 hover:text-white hover:bg-gray-800
                      transition-colors duration-150
                    "
                    aria-label="Join Telegram"
                  >
                    <MessageCircle className="w-5 h-5" />
                  </a>

                  {/* Discord */}
                  <a
                    href={SOCIAL_LINKS.discord}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="
                      p-2 rounded-lg
                      text-gray-400 hover:text-white hover:bg-gray-800
                      transition-colors duration-150
                    "
                    aria-label="Join Discord"
                  >
                    <DiscordIcon className="w-5 h-5" />
                  </a>

                  {/* GitHub */}
                  <a
                    href={SOCIAL_LINKS.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="
                      p-2 rounded-lg
                      text-gray-400 hover:text-white hover:bg-gray-800
                      transition-colors duration-150
                    "
                    aria-label="View on GitHub"
                  >
                    <Github className="w-5 h-5" />
                  </a>
                </div>

                {/* Divider */}
                <div className="w-px h-6 bg-gray-700" />

                {/* Share Button */}
                <div className="relative">
                  <button
                    onClick={handleShare}
                    className="
                      flex items-center gap-2 px-3 py-2
                      bg-gray-800 hover:bg-gray-700
                      border border-gray-700 hover:border-gray-600
                      text-gray-300 hover:text-white
                      text-sm font-medium
                      rounded-lg
                      transition-all duration-150
                    "
                  >
                    {showCopiedToast ? (
                      <>
                        <Check className="w-4 h-4 text-green-500" />
                        <span className="text-green-500">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="w-4 h-4" />
                        <span>Share this dApp</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="py-4 border-t border-gray-800/50">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-xs text-gray-500">
              <span>Non-custodial • Open Source • Powered by Ergo Blockchain</span>
            </div>
          </div>
        </div>
      </footer>

      {/* KYA Modal */}
      <KYAModal isOpen={isKYAOpen} onClose={() => setIsKYAOpen(false)} />
    </>
  );
};

export default Footer;
