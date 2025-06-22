
'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Menu, X } from 'lucide-react';

// Import image assets (adjust paths based on your project structure)
import logo from '../../public/images/logo.png';
import homeIcon from '../../public/images/navbar/remove_11934537.png';
import friendlistIcon from '../../public/images/navbar/friendlist.png';
import addfriendIcon from '../../public/images/navbar/add-friend.png';
import groupslistIcon from '../../public/images/navbar/group.png';
import joingroupIcon from '../../public/images/navbar/join-group.png';
import notificationIcon from '../../public/images/navbar/bell.png';
import chatIcon from '../../public/images/navbar/chat.png';

// Interface for navigation items
interface NavItemProps {
  href: string;
  icon: any;
  alt: string;
  label: string;
  onClick?: () => void;
  isDropdown?: boolean;
}

// Desktop/Mobile Nav Item Component
const NavItem: React.FC<NavItemProps> = ({ href, icon, alt, label, onClick, isDropdown }) => (
  <motion.div
    whileHover={{ scale: isDropdown ? 1.02 : 1.05 }}
    whileTap={{ scale: 0.95 }}
    className={`flex items-center relative group ${isDropdown ? 'w-full bg-gray-50 hover:bg-blue-50 rounded-lg px-4 py-3' : ''}`}
  >
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center w-full ${isDropdown ? 'space-x-4' : 'px-3 py-3 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-300'}`}
      aria-label={label}
    >
      <Image
        src={icon}
        alt={alt}
        width={35}
        height={35}
        className="object-contain transition-transform duration-300 group-hover:scale-110"
      />
      {isDropdown ? (
        <span className="text-base font-medium text-gray-700">{label}</span>
      ) : (
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="hidden group-hover:md:block absolute left-10 transform -translate-x-1/2 top-full mt-2 bg-gray-800 text-white px-2 py-1 rounded-md text-xs shadow-lg whitespace-nowrap z-50"
        >
          {label}
        </motion.span>
      )}
    </Link>
  </motion.div>
);

// Action Nav Item Component (for Chat and Notifications)
const ActionNavItem: React.FC<NavItemProps> = ({ href, icon, alt, label }) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    className="flex items-center relative group"
  >
    <Link
      href={href}
      className="flex items-center px-1 py-3 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-300 group"
      aria-label={label}
    >
      <Image
        src={icon}
        alt={alt}
        width={35}
        height={35}
        className="object-contain transition-transform duration-300 group-hover:scale-110"
      />
      <motion.span
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="hidden group-hover:md:block absolute left-10 transform -translate-x-1/2 top-full mt-2 bg-gray-800 text-white px-2 py-1 rounded-md text-xs shadow-lg whitespace-nowrap z-50"
      >
        {label}
      </motion.span>
    </Link>
  </motion.div>
);

const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  // Cleanup on component unmount
  useEffect(() => {
    return () => setIsMobileMenuOpen(false); // Reset state on unmount
  }, []);

  // Define mobile menu variants with explicit typing
  const mobileMenuVariants: Variants = {
    open: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: 'easeOut' as const },
    },
    closed: {
      opacity: 0,
      y: '-100%',
      transition: { duration: 0.3, ease: 'easeIn' as const },
    },
  };

  return (
    <>
      {/* Main Navbar */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="fixed top-0 left-0 w-full bg-white shadow-lg z-50"
      >
        <div className="container mx-auto sm:px-12 px-5 py-4 flex justify-between items-center h-20">
          {/* Logo Section */}
          <Link href="/" className="flex items-center flex-shrink-0">
            <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.3 }}>
              <Image
                src={logo}
                alt="UniChat Logo"
                className="w-33 h-15 sm:w-40 sm:h-20" // Responsive sizes
              />
            </motion.div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center space-x-8 mx-auto">
            <NavItem href="/" icon={homeIcon} alt="Home" label="Home" />
            <NavItem href="/friends" icon={friendlistIcon} alt="Friend List" label="Friends" />
            <NavItem href="/friends/add" icon={addfriendIcon} alt="Add Friend" label="Add Friend" />
            <NavItem href="/groups" icon={groupslistIcon} alt="Groups List" label="Groups" />
            <NavItem href="/groups/join" icon={joingroupIcon} alt="Join Group" label="Join Group" />
          </div>

          {/* Right Action Icons (All Screens) */}
          <div className="flex items-center space-x-6 flex-shrink-0">
            <ActionNavItem href="/chat" icon={chatIcon} alt="Chat" label="Chat" />
            <ActionNavItem href="/notifications" icon={notificationIcon} alt="Notifications" label="Notifications" />
            {/* Hamburger Menu Button (Mobile & Tablet) */}
            <button
              className="lg:hidden text-gray-600 hover:text-blue-600 focus:outline-none"
              onClick={toggleMobileMenu}
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              variants={mobileMenuVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="lg:hidden bg-white shadow-xl border-t border-gray-200 rounded-b-lg mx-4 mb-4"
              role="menu"
            >
              <div className="container mx-auto px-4 py-4 space-y-2 max-w-md">
                <NavItem href="/" icon={homeIcon} alt="Home" label="Home" onClick={toggleMobileMenu} isDropdown={true} />
                <NavItem href="/friends" icon={friendlistIcon} alt="Friend List" label="Friends" onClick={toggleMobileMenu} isDropdown={true} />
                <NavItem href="/friends/add" icon={addfriendIcon} alt="Add Friend" label="Add Friend" onClick={toggleMobileMenu} isDropdown={true} />
                <NavItem href="/groups" icon={groupslistIcon} alt="Groups List" label="Groups" onClick={toggleMobileMenu} isDropdown={true} />
                <NavItem href="/groups/join" icon={joingroupIcon} alt="Join Group" label="Join Group" onClick={toggleMobileMenu} isDropdown={true} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  );
};

export default Navbar;
