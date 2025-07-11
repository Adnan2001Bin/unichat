'use client';

import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { useEffect } from 'react';

const SignoutButton: React.FC = () => {
  const router = useRouter();
  const { status } = useSession();

  const handleSignout = async () => {
    try {
      await signOut({ redirect: false });
      toast.success('Signed out successfully', {
        className:
          'bg-green-600 text-white border-green-700 backdrop-blur-md bg-opacity-80',
        duration: 4000,
      });
      // Redirect after sign-out
      router.replace('/sign-in');
    } catch (error) {
      toast.error('Error', {
        description: 'Failed to sign out. Please try again.',
        className:
          'bg-red-600 text-white border-red-700 backdrop-blur-md bg-opacity-80',
        duration: 4000,
      });
    }
  };

  // Monitor session status to ensure redirect after sign-out
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/sign-in');
    }
  }, [status, router]);

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="flex items-center relative group"
    >
      <button
        onClick={handleSignout}
        className="flex items-center px-3 py-3 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-300"
        aria-label="Sign Out"
      >
        <LogOut className="w-7 h-7 md:w-8 md:h-8 text-gray-700 group-hover:text-blue-600" />
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="hidden group-hover:lg:block absolute left-1/2 transform -translate-x-1/2 top-full mt-2 bg-gray-800 text-white px-2 py-1 rounded-md text-xs shadow-lg whitespace-nowrap z-50"
        >
          Sign Out
        </motion.span>
      </button>
    </motion.div>
  );
};

export default SignoutButton;