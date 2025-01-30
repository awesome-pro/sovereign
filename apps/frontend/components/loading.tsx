'use client';

import { motion } from "framer-motion";

const EstateLoading = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#0F172A] text-white">
      {/* Logo Animation */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
        className="relative"
      >
        <div className="w-16 h-16 border-4 border-gray-300 rounded-full border-t-transparent animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center text-xl font-semibold tracking-wide">
          E
        </div>
      </motion.div>

      {/* Text */}
      <motion.p 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8 }}
        className="mt-4 text-lg font-light text-gray-300"
      >
        Elevating Real Estate, One Deal at a Time...
      </motion.p>

      {/* Subtle shimmer effect */}
      <div className="mt-6 w-32 h-1 bg-gradient-to-r from-transparent via-gray-400 to-transparent animate-pulse"></div>
    </div>
  );
};

export default EstateLoading;
