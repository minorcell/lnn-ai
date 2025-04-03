'use client';

import Link from 'next/link';
import { motion } from 'motion/react';

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      >
        <Link href="/llm">
          <motion.div
            className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-lg cursor-pointer"
            whileHover={{ 
              scale: 1.1,
              boxShadow: '0 0 25px rgba(59, 130, 246, 0.5)'
            }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 10 }}
          >
            开始聊天
          </motion.div>
        </Link>
      </motion.div>
    </div>
  );
}
