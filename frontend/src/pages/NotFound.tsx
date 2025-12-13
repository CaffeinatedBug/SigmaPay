/**
 * ===========================================
 * 404 Not Found Page
 * ===========================================
 */

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-ergo-dark flex items-center justify-center px-4">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-ergo-main/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-30%] right-[-15%] w-[50%] h-[50%] bg-purple-600/5 rounded-full blur-[150px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 text-center"
      >
        {/* 404 Number */}
        <h1 className="text-[150px] md:text-[200px] font-bold leading-none bg-gradient-to-b from-white to-gray-600 bg-clip-text text-transparent">
          404
        </h1>

        {/* Message */}
        <h2 className="text-2xl md:text-3xl font-semibold text-white mb-4 -mt-4">
          Page Not Found
        </h2>
        <p className="text-gray-400 mb-8 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/"
            className="
              flex items-center gap-2 px-6 py-3
              bg-ergo-main hover:bg-orange-600
              text-white font-semibold
              rounded-xl transition-colors
              shadow-lg shadow-ergo-main/25
            "
          >
            <Home className="w-5 h-5" />
            Go Home
          </Link>

          <button
            onClick={() => window.history.back()}
            className="
              flex items-center gap-2 px-6 py-3
              bg-ergo-card hover:bg-ergo-card/80
              border border-ergo-border
              text-gray-300 font-semibold
              rounded-xl transition-colors
            "
          >
            <ArrowLeft className="w-5 h-5" />
            Go Back
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
