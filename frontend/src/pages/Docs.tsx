import { motion } from "framer-motion";
import { Button } from "../components/ui/button";
import { 
  Book,
  Terminal,
  Server,
  FileCode,
  AlertTriangle,
  Copy,
  Check,
  ArrowLeft
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

// Code Block Component with copy functionality
const CodeBlock = ({ code }: { code: string; language?: string }) => {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <div className="absolute right-3 top-3 z-10">
        <button
          onClick={handleCopy}
          className="p-2 rounded-lg bg-secondary/80 border border-border hover:bg-secondary transition-colors"
        >
          {copied ? (
            <Check className="h-4 w-4 text-primary" />
          ) : (
            <Copy className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
      </div>
      <pre className="p-4 rounded-xl bg-[#0a0a0a] border border-border overflow-x-auto">
        <code className="text-sm font-mono text-foreground/90">{code}</code>
      </pre>
    </div>
  );
};

const Docs = () => {
  return (
    <main className="min-h-screen bg-background">
      <section className="relative py-20 overflow-hidden">
        {/* Background gradient orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/15 rounded-full blur-[128px] animate-pulse-glow" />
          <div className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-primary/10 rounded-full blur-[100px] animate-pulse-glow" style={{ animationDelay: "1.5s" }} />
        </div>
        
        {/* Grid pattern overlay */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
                             linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
            backgroundSize: "60px 60px"
          }}
        />

        <div className="relative z-10 container mx-auto px-6">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-8"
          >
            <Link to="/">
              <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Button>
            </Link>
          </motion.div>

          {/* Section Header */}
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-secondary/50 backdrop-blur-sm mb-6">
              <Book className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">Developer Documentation</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4">
              SigmaPay <span className="text-gradient">Documentation</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to integrate SigmaPay into your application.
            </p>
          </motion.div>

          {/* Documentation Content */}
          <div className="max-w-4xl mx-auto space-y-12">
            
            {/* 1. Overview */}
            <motion.div 
              className="space-y-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                  <FileCode className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">1. Overview</h2>
              </div>
              <div className="pl-12 space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  SigmaPay is a <span className="text-foreground font-medium">non-custodial payment gateway</span> for the Ergo blockchain. 
                  It allows merchants to accept ERG and SigUSD directly on their frontend while cryptographically verifying payments on their backend.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-secondary/50 border border-border">
                    <span className="text-xs text-muted-foreground uppercase tracking-wide">Network</span>
                    <p className="text-foreground font-medium mt-1">Ergo (Mainnet/Testnet)</p>
                  </div>
                  <div className="p-4 rounded-xl bg-secondary/50 border border-border">
                    <span className="text-xs text-muted-foreground uppercase tracking-wide">Architecture</span>
                    <p className="text-foreground font-medium mt-1">Client + Server Verification</p>
                  </div>
                  <div className="p-4 rounded-xl bg-secondary/50 border border-border">
                    <span className="text-xs text-muted-foreground uppercase tracking-wide">Settlement</span>
                    <p className="text-foreground font-medium mt-1">Instant (Peer-to-Peer)</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* 2. Installation */}
            <motion.div 
              className="space-y-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                  <Terminal className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">2. Installation</h2>
              </div>
              <div className="pl-12 space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  To use the SigmaPay widget, you need to install the core Fleet SDK libraries for transaction building.
                </p>
                <CodeBlock code="npm install @fleet-sdk/core @fleet-sdk/common axios" language="bash" />
              </div>
            </motion.div>

            {/* 3. Frontend Integration */}
            <motion.div 
              className="space-y-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                  <FileCode className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">3. Frontend Integration</h2>
              </div>
              <div className="pl-12 space-y-6">
                <p className="text-muted-foreground leading-relaxed">
                  The core of the integration is the <code className="px-2 py-0.5 rounded bg-secondary text-primary font-mono text-sm">SigmaPayWidget</code> component. 
                  This handles the wallet connection, transaction construction, and signing.
                </p>
                
                {/* Component Props Table */}
                <div className="rounded-xl border border-border overflow-hidden">
                  <div className="px-4 py-3 bg-secondary/50 border-b border-border">
                    <span className="font-semibold text-foreground">Component Props</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border bg-secondary/30">
                          <th className="px-4 py-3 text-left text-muted-foreground font-medium">Prop</th>
                          <th className="px-4 py-3 text-left text-muted-foreground font-medium">Type</th>
                          <th className="px-4 py-3 text-left text-muted-foreground font-medium">Required</th>
                          <th className="px-4 py-3 text-left text-muted-foreground font-medium">Description</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        <tr>
                          <td className="px-4 py-3 font-mono text-primary">merchantAddress</td>
                          <td className="px-4 py-3 font-mono text-foreground/70">string</td>
                          <td className="px-4 py-3 text-foreground">Yes</td>
                          <td className="px-4 py-3 text-muted-foreground">The Ergo address where funds should be sent.</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 font-mono text-primary">amount</td>
                          <td className="px-4 py-3 font-mono text-foreground/70">number</td>
                          <td className="px-4 py-3 text-foreground">Yes</td>
                          <td className="px-4 py-3 text-muted-foreground">The amount to charge (in ERG).</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 font-mono text-primary">tokenId</td>
                          <td className="px-4 py-3 font-mono text-foreground/70">string</td>
                          <td className="px-4 py-3 text-foreground">No</td>
                          <td className="px-4 py-3 text-muted-foreground">Token ID if charging in SigUSD. Leave undefined for ERG.</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 font-mono text-primary">onSuccess</td>
                          <td className="px-4 py-3 font-mono text-foreground/70">{`(txId: string) => void`}</td>
                          <td className="px-4 py-3 text-foreground">No</td>
                          <td className="px-4 py-3 text-muted-foreground">Callback after a successful transaction broadcast.</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 font-mono text-primary">onError</td>
                          <td className="px-4 py-3 font-mono text-foreground/70">{`(error: string) => void`}</td>
                          <td className="px-4 py-3 text-foreground">No</td>
                          <td className="px-4 py-3 text-muted-foreground">Callback if user rejects or network fails.</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Usage Example */}
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">Usage Example</h3>
                  <CodeBlock code={`import { SigmaPayWidget } from "@/components/SigmaPayWidget";

export default function CheckoutPage() {
  const handleSuccess = (txId: string) => {
    console.log("Payment successful! TX ID:", txId);
    // Redirect to success page or verify with backend
  };

  return (
    <div className="flex justify-center items-center h-screen bg-black">
      <div className="w-full max-w-md">
        <h1 className="text-white text-2xl mb-4">Checkout</h1>
        <SigmaPayWidget
          merchantAddress="9hA8MkqGy78oG84S94K74vWvP58gC465e9d48b79"
          amount={10}
          onSuccess={handleSuccess}
        />
      </div>
    </div>
  );
}`} />
                </div>
              </div>
            </motion.div>

            {/* 4. Backend Verification */}
            <motion.div 
              className="space-y-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                  <Server className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">4. Backend Verification (Anti-Fraud)</h2>
              </div>
              <div className="pl-12 space-y-6">
                {/* Critical Warning */}
                <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30 flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-foreground font-medium">CRITICAL: Never trust the frontend onSuccess callback alone.</p>
                    <p className="text-muted-foreground text-sm mt-1">
                      Malicious users can spoof frontend states. You must verify the transaction hash with the SigmaPay Backend API.
                    </p>
                  </div>
                </div>

                {/* API Endpoint */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-foreground">API Endpoint</h3>
                  <div className="flex flex-wrap gap-4">
                    <div className="px-4 py-2 rounded-lg bg-secondary/50 border border-border">
                      <span className="text-xs text-muted-foreground">URL</span>
                      <p className="font-mono text-primary text-sm">https://sigmapay.onrender.com/api/payments/verify</p>
                    </div>
                    <div className="px-4 py-2 rounded-lg bg-secondary/50 border border-border">
                      <span className="text-xs text-muted-foreground">Method</span>
                      <p className="font-mono text-foreground text-sm">POST</p>
                    </div>
                  </div>
                </div>

                {/* Request Body */}
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">Request Body</h3>
                  <CodeBlock code={`{
  "txId": "8867137f613149950596395b09045749b50e26b1d120a...",
  "merchantAddress": "9hA8MkqGy78oG84S94K74vWvP58gC465e9d48b79",
  "expectedAmountErg": 10
}`} language="json" />
                </div>

                {/* Response Success */}
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">Response (Success - 200 OK)</h3>
                  <CodeBlock code={`{
  "verified": true,
  "isConfirmed": false,
  "blockHeight": 114532,
  "timestamp": 1698754321
}`} language="json" />
                  <p className="text-sm text-muted-foreground mt-2">
                    <span className="text-foreground font-medium">Note:</span> <code className="px-1 py-0.5 rounded bg-secondary text-primary font-mono text-xs">isConfirmed</code> will 
                    be <code className="px-1 py-0.5 rounded bg-secondary text-primary font-mono text-xs">false</code> if the transaction is in the mempool (0 confirmations) but valid. 
                    It becomes <code className="px-1 py-0.5 rounded bg-secondary text-primary font-mono text-xs">true</code> after 1 block confirmation.
                  </p>
                </div>

                {/* Response Failure */}
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">Response (Failure - 400/404)</h3>
                  <CodeBlock code={`{
  "success": false,
  "error": "Transaction not found or invalid output amount"
}`} language="json" />
                </div>
              </div>
            </motion.div>

            {/* 5. TypeScript Interfaces */}
            <motion.div 
              className="space-y-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                  <FileCode className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">5. TypeScript Interfaces</h2>
              </div>
              <div className="pl-12 space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  Use these types to ensure type safety in your integration.
                </p>
                <CodeBlock code={`// The response from the Backend API
interface VerificationResponse {
  verified: boolean;
  isConfirmed: boolean;
  blockHeight?: number;
  timestamp?: number;
  error?: string;
}

// Props for the Widget
interface SigmaPayProps {
  merchantAddress: string;
  amount: number;
  tokenId?: string;
  onSuccess?: (txId: string) => void;
  onError?: (msg: string) => void;
}`} />
              </div>
            </motion.div>

            {/* 6. Troubleshooting */}
            <motion.div 
              className="space-y-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                  <AlertTriangle className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">6. Troubleshooting</h2>
              </div>
              <div className="pl-12 space-y-4">
                {/* Error 1 */}
                <div className="p-4 rounded-xl bg-secondary/50 border border-border space-y-2">
                  <code className="text-sm font-mono text-destructive">"ReferenceError: window is not defined"</code>
                  <p className="text-muted-foreground text-sm">
                    <span className="text-foreground font-medium">Cause:</span> You are trying to run payment.ts logic (which looks for Nautilus) on the server-side (Node.js/Next.js SSR).
                  </p>
                  <p className="text-muted-foreground text-sm">
                    <span className="text-foreground font-medium">Fix:</span> Ensure the widget is only rendered on the client. Use <code className="px-1 py-0.5 rounded bg-background text-primary font-mono text-xs">useEffect</code> or 
                    dynamic imports with <code className="px-1 py-0.5 rounded bg-background text-primary font-mono text-xs">ssr: false</code> if using Next.js.
                  </p>
                </div>

                {/* Error 2 */}
                <div className="p-4 rounded-xl bg-secondary/50 border border-border space-y-2">
                  <code className="text-sm font-mono text-destructive">"Transaction rejected by user"</code>
                  <p className="text-muted-foreground text-sm">
                    <span className="text-foreground font-medium">Cause:</span> The user closed the Nautilus popup window without signing.
                  </p>
                  <p className="text-muted-foreground text-sm">
                    <span className="text-foreground font-medium">Fix:</span> Handle this in the <code className="px-1 py-0.5 rounded bg-background text-primary font-mono text-xs">onError</code> prop to show a "Payment Cancelled" message.
                  </p>
                </div>

                {/* Error 3 */}
                <div className="p-4 rounded-xl bg-secondary/50 border border-border space-y-2">
                  <code className="text-sm font-mono text-destructive">"Output amount too low"</code>
                  <p className="text-muted-foreground text-sm">
                    <span className="text-foreground font-medium">Cause:</span> The backend verification found a transaction, but the amount sent was less than expectedAmountErg.
                  </p>
                  <p className="text-muted-foreground text-sm">
                    <span className="text-foreground font-medium">Fix:</span> Ensure your frontend <code className="px-1 py-0.5 rounded bg-background text-primary font-mono text-xs">amount</code> prop matches exactly what you send to the backend for verification.
                  </p>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-6 text-center">
          <p className="text-sm text-muted-foreground">
            © 2024 SigmaPay. Built on Ergo Blockchain.
          </p>
        </div>
      </footer>
    </main>
  );
};

export default Docs;
