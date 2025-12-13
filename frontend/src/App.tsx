import { useState, useCallback } from 'react'
import SigmaPayWidget from './components/SigmaPayWidget'
import WalletConnect from './components/WalletConnect'
import { WalletContext } from './utils/payment'
import { Zap } from 'lucide-react'

function App() {
  // Shared wallet state between header and widget
  const [walletContext, setWalletContext] = useState<WalletContext | null>(null)

  // Handle wallet connection changes from WalletConnect component
  const handleWalletChange = useCallback((address: string | null, context: WalletContext | null) => {
    setWalletContext(context)
    console.log('[App] Wallet changed:', address ? `Connected: ${address}` : 'Disconnected')
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
      </div>

      {/* Header / Navbar */}
      <header className="relative z-20 border-b border-gray-800/50 bg-gray-900/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/20">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-white font-bold text-lg tracking-tight">SigmaPay</h1>
                <p className="text-gray-500 text-xs -mt-0.5">Ergo Payment Gateway</p>
              </div>
            </div>

            {/* Wallet Connect Button */}
            <WalletConnect onWalletChange={handleWalletChange} />
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="relative z-10 flex items-center justify-center min-h-[calc(100vh-4rem)] p-4">
        <SigmaPayWidget externalWalletContext={walletContext} />
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-4 text-center">
        <p className="text-gray-600 text-xs">
          Built on{' '}
          <a 
            href="https://ergoplatform.org" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-orange-500 hover:text-orange-400 transition-colors"
          >
            Ergo Blockchain
          </a>
          {' '}• Non-custodial & Secure
        </p>
      </footer>
    </div>
  )
}

export default App
