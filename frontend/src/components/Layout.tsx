/**
 * ===========================================
 * Layout Component
 * ===========================================
 * 
 * Main layout wrapper with:
 * - Dark mesh gradient background
 * - Navbar with SigmaPay logo + WalletConnect
 * - Footer with copyright + KYA link
 */

import { ReactNode, useState } from 'react';
import WalletConnect from './WalletConnect';
import KYAModal from './KYAModal';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [isKYAOpen, setIsKYAOpen] = useState(false);

  return (
    <div className="min-h-screen bg-mesh-gradient text-white font-sans selection:bg-ergo-main selection:text-white overflow-hidden relative flex flex-col">
      
      {/* ========== MESH BACKGROUND ========== */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-ergo-main/8 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-30%] right-[-15%] w-[50%] h-[50%] bg-purple-600/8 rounded-full blur-[150px]" />
        <div className="absolute top-[40%] right-[20%] w-[30%] h-[30%] bg-blue-500/5 rounded-full blur-[120px]" />
      </div>

      {/* ========== NAVBAR ========== */}
      <nav className="relative z-50 flex items-center justify-between px-6 md:px-8 py-5 max-w-7xl mx-auto w-full">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-ergo-main to-orange-600 rounded-xl flex items-center justify-center font-bold text-white text-lg shadow-lg shadow-ergo-main/30">
            Σ
          </div>
          <span className="text-xl font-bold tracking-tight">SigmaPay</span>
        </div>

        {/* Wallet Connect Button */}
        <WalletConnect />
      </nav>

      {/* ========== MAIN CONTENT ========== */}
      <main className="relative z-10 flex-1 max-w-7xl mx-auto w-full px-4 py-8 flex flex-col items-center justify-center">
        {children}
      </main>

      {/* ========== FOOTER ========== */}
      <footer className="relative z-10 border-t border-white/5 py-6 px-6 md:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <p>© {new Date().getFullYear()} SigmaPay. Built on Ergo.</p>
          <button
            onClick={() => setIsKYAOpen(true)}
            className="text-ergo-main hover:text-orange-400 transition-colors font-medium"
          >
            Know Your Assumptions (KYA)
          </button>
        </div>
      </footer>

      {/* KYA Modal */}
      <KYAModal isOpen={isKYAOpen} onClose={() => setIsKYAOpen(false)} />
    </div>
  );
};

export default Layout;