"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { HomeIcon, ArrowLeftIcon } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <motion.div
          initial={{ rotate: -10 }}
          animate={{ 
            rotate: [0, -10, 10, 0],
            transition: { 
              duration: 2, 
              repeat: Infinity, 
              repeatType: 'mirror' 
            } 
          }}
          className="relative inline-block"
        >
          <h1 className="text-[12rem] font-black text-indigo-600 dark:text-indigo-400 drop-shadow-2xl">
            404
          </h1>
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ 
              opacity: [0, 1, 0], 
              scale: [0.5, 1, 1.2],
              transition: { 
                duration: 2, 
                repeat: Infinity, 
                repeatType: 'loop' 
              } 
            }}
            className="absolute top-0 right-0 -mr-12 -mt-12 text-6xl text-red-500 dark:text-red-400"
          >
            !
          </motion.div>
        </motion.div>

        <motion.h2 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-4xl font-bold text-gray-800 dark:text-gray-100 mt-4"
        >
          Oops! Page Not Found
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-4 text-xl text-gray-600 dark:text-gray-400 max-w-xl mx-auto"
        >
          The page you are looking for seems to have wandered off into the digital wilderness. 
          Don't worry, we'll help you find your way back home.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="mt-8 flex justify-center space-x-4"
        >
          <Link href="/dashboard" className="group">
            <div className="flex items-center px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:bg-indigo-700 transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-xl">
              <HomeIcon className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
              Back to Dashboard
            </div>
          </Link>
          
          <Link href="/" className="group">
            <div className="flex items-center px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold rounded-lg shadow-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-xl">
              <ArrowLeftIcon className="mr-2 h-5 w-5 group-hover:-translate-x-1 transition-transform" />
              Go Home
            </div>
          </Link>
        </motion.div>
      </motion.div>

      {/* Decorative Elements */}
      <motion.div
        initial={{ opacity: 0, x: -100 }}
        animate={{ 
          opacity: [0, 0.1, 0],
          x: [-100, 100, -100],
          transition: { 
            duration: 10, 
            repeat: Infinity, 
            repeatType: 'loop' 
          } 
        }}
        className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-100 dark:bg-indigo-900 rounded-full blur-3xl opacity-30"
      />
      <motion.div
        initial={{ opacity: 0, x: 100 }}
        animate={{ 
          opacity: [0, 0.1, 0],
          x: [100, -100, 100],
          transition: { 
            duration: 12, 
            repeat: Infinity, 
            repeatType: 'loop' 
          } 
        }}
        className="absolute top-0 right-0 w-64 h-64 bg-blue-100 dark:bg-blue-900 rounded-full blur-3xl opacity-30"
      />
    </div>
  );
}
