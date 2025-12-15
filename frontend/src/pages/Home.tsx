import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Timeline } from "@/components/ui/timeline";
import { Button } from "@/components/ui/button";
import { 
  Wallet, 
  ShieldCheck, 
  Zap, 
  ArrowRight, 
  CheckCircle2,
  Lock,
  Coins,
  RefreshCw
} from "lucide-react";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background gradient orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px] animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary/10 rounded-full blur-[100px] animate-pulse-glow" style={{ animationDelay: "1s" }} />
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

      <div className="relative z-10 container mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Badge */}
          <motion.div 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-secondary/50 backdrop-blur-sm mb-8"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-sm text-muted-foreground">Non-Custodial Payment Gateway</span>
          </motion.div>

          {/* Main heading */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6">
            <span className="text-foreground">Accept Crypto on</span>
            <br />
            <span className="text-gradient">Ergo</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            The decentralized payment gateway for merchants. Accept ERG and SigUSD 
            directly — no intermediaries, no custody, just instant settlements.
          </p>

          {/* CTA Buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Link to="/payment">
              <Button variant="hero" size="xl">
                Launch App
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/docs">
              <Button variant="outline" size="lg">
                View Documentation
              </Button>
            </Link>
          </motion.div>

          {/* Trust indicators */}
          <motion.div 
            className="flex items-center justify-center gap-8 mt-16 text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-primary" />
              <span className="text-sm">Non-Custodial</span>
            </div>
            <div className="flex items-center gap-2">
              <Coins className="h-4 w-4 text-primary" />
              <span className="text-sm">ERG & SigUSD</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-sm">Instant Settlement</span>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div 
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 10, 0] }}
        transition={{ 
          opacity: { delay: 1 },
          y: { repeat: Infinity, duration: 2 }
        }}
      >
        <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex justify-center pt-2">
          <div className="w-1 h-2 bg-primary rounded-full" />
        </div>
      </motion.div>
    </section>
  );
};

const TimelineContent = ({ 
  icon: Icon, 
  title, 
  description, 
  features 
}: { 
  icon: React.ElementType;
  title: string;
  description: string;
  features: string[];
}) => (
  <div className="space-y-6">
    <div className="flex items-start gap-4">
      <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <div className="flex-1">
        <h4 className="text-xl md:text-2xl font-semibold text-foreground mb-2">
          {title}
        </h4>
        <p className="text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>
    </div>
    
    {/* Features list */}
    <div className="space-y-3 pl-0 md:pl-16">
      {features.map((feature, idx) => (
        <div key={idx} className="flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
          <span className="text-foreground/80">{feature}</span>
        </div>
      ))}
    </div>
    
    {/* Image placeholder */}
    <div className="mt-6 rounded-xl bg-secondary border border-border overflow-hidden">
      <div className="h-48 md:h-64 flex items-center justify-center relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
        <div className="text-center z-10">
          <RefreshCw className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
          <span className="text-sm text-muted-foreground">Screenshot placeholder</span>
        </div>
      </div>
    </div>
  </div>
);

const timelineData = [
  {
    title: "Step 01",
    content: (
      <TimelineContent
        icon={Wallet}
        title="Connect Your Wallet"
        description="Seamlessly connect your Nautilus wallet to SigmaPay. Your private keys stay with you — we never have access to your funds. This is true non-custodial integration."
        features={[
          "One-click Nautilus wallet connection",
          "No account creation required",
          "Full control of your private keys",
          "Support for ERG and SigUSD tokens"
        ]}
      />
    ),
  },
  {
    title: "Step 02",
    content: (
      <TimelineContent
        icon={ShieldCheck}
        title="Smart Verification"
        description="Our backend performs real-time UTXO verification on the Ergo blockchain. Every transaction is cryptographically verified, ensuring complete security and transparency for both merchants and customers."
        features={[
          "Real-time UTXO scanning",
          "Cryptographic proof validation",
          "Automatic confirmation tracking",
          "Zero-knowledge payment verification"
        ]}
      />
    ),
  },
  {
    title: "Step 03",
    content: (
      <TimelineContent
        icon={Zap}
        title="Instant Settlement"
        description="Funds are transferred directly to the merchant's wallet address — no intermediaries, no delays. Experience true peer-to-peer commerce on the Ergo blockchain with immediate access to your earnings."
        features={[
          "Direct wallet-to-wallet transfers",
          "No holding periods or delays",
          "Zero counterparty risk",
          "Full transaction transparency"
        ]}
      />
    ),
  },
];

const Home = () => {
  return (
    <main className="min-h-screen bg-background">
      <Hero />
      
      {/* Timeline Section */}
      <section className="py-20">
        <div className="container mx-auto px-6 mb-16">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A simple, secure, and transparent payment flow powered by the Ergo blockchain.
            </p>
          </motion.div>
        </div>
        
        <Timeline data={timelineData} />
      </section>

      {/* CTA Section */}
      <section className="py-20 border-t border-border">
        <div className="container mx-auto px-6">
          <motion.div 
            className="max-w-3xl mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Ready to Accept Crypto?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join the future of decentralized commerce. Set up SigmaPay in minutes.
            </p>
            <Link to="/payment">
              <Button variant="hero" size="xl">
                Get Started Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-6 text-center">
          <p className="text-sm text-muted-foreground">
            © 2025 SigmaPay. Built on Ergo Blockchain.
          </p>
        </div>
      </footer>
    </main>
  );
};

export default Home;