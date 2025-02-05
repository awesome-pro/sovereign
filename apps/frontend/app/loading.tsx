"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Loader2Icon, BuildingIcon } from 'lucide-react';

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ 
          opacity: 1, 
          scale: 1,
          rotate: [0, 360],
          transition: { 
            duration: 1.5, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }
        }}
        className="mb-8"
      >
        <BuildingIcon 
          className="h-24 w-24 text-indigo-600 dark:text-indigo-400 drop-shadow-xl" 
          strokeWidth={1.5}
        />
      </motion.div>

      <div className="flex items-center space-x-3">
        <motion.div
          animate={{ 
            rotate: [0, 360],
            transition: { 
              duration: 1, 
              repeat: Infinity, 
              ease: "linear" 
            }
          }}
        >
          <Loader2Icon 
            className="h-8 w-8 text-indigo-500 dark:text-indigo-300 animate-spin" 
            strokeWidth={2}
          />
        </motion.div>
        
        <div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ 
              opacity: 1, 
              y: 0,
              transition: { delay: 0.3, duration: 0.5 }
            }}
            className="text-3xl font-bold text-gray-800 dark:text-gray-100"
          >
            Sovereign CRM
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ 
              opacity: 1, 
              y: 0,
              transition: { delay: 0.5, duration: 0.5 }
            }}
            className="text-sm text-gray-600 dark:text-gray-400 mt-2 text-center"
          >
            Preparing your personalized workspace...
          </motion.p>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ 
          opacity: 1, 
          y: 0,
          transition: { delay: 0.7, duration: 0.5 }
        }}
        className="mt-12 w-64 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden"
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ 
            width: '100%',
            transition: { 
              duration: 2, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }
          }}
          className="h-full bg-indigo-500 dark:bg-indigo-400"
        />
      </motion.div>
    </div>
  );
}
