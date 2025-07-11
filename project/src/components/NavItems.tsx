import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface NavItemProps {
  href: string;
  icon: any;
  alt: string;
  label: string;
  onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ href, icon, alt, label, onClick }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="flex items-center relative group lg:whileHover lg:whileTap"
    >
      <Link
        href={href}
        onClick={onClick}
        className="flex items-center px-3 py-3 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-300"
        aria-label={label}
      >
        <Image
          src={icon}
          alt={alt}
          className="w-7 h-7 md:w-8 md:h-8 object-contain transition-transform duration-300 group-hover:lg:scale-110"
        />
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="hidden group-hover:lg:block absolute left-1/2 transform -translate-x-1/2 top-full mt-2 bg-gray-800 text-white px-2 py-1 rounded-md text-xs shadow-lg whitespace-nowrap z-50 lg:initial lg:animate lg:transition"
        >
          {label}
        </motion.span>
      </Link>
    </motion.div>
  );
};



export default NavItem;