/**
 * ===========================================
 * Payment Page
 * ===========================================
 * 
 * Dedicated page for the SigmaPay payment widget.
 */

import Layout from '../components/Layout';
import SigmaPayWidget from '../components/SigmaPayWidget';
import { WalletProvider } from '../context/WalletContext';

const Payment = () => {
  return (
    <WalletProvider>
      <Layout>
        <SigmaPayWidget />
      </Layout>
    </WalletProvider>
  );
};

export default Payment;
