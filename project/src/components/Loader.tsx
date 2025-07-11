'use client';

import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface LoaderProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

const Loader: React.FC<LoaderProps> = ({ message = 'Loading Unichat...', size = 'md' }) => {
  const sizeClasses: { [key in 'sm' | 'md' | 'lg']: string } = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-purple-100 backdrop-blur-sm">
      <motion.div
        className="flex flex-col items-center space-y-5 p-8 bg-white rounded-3xl shadow-xl border border-gray-200"
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut', type: 'spring', damping: 10 }}
      >
        <motion.div
          className={`text-indigo-600 ${sizeClasses[size]} p-1 rounded-full bg-indigo-50`}
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        >
          <Loader2 />
        </motion.div>
        <motion.p
          className="text-gray-700 text-lg sm:text-xl font-semibold tracking-wide"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3, ease: 'easeOut' }}
        >
          {message}
        </motion.p>
        <motion.div
          className="w-24 h-1 bg-indigo-200 rounded-full overflow-hidden"
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: 1, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
        >
          <motion.div
            className="h-full bg-indigo-500"
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Loader;