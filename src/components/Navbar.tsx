'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import NavItem, { ActionNavItem } from './NavItems';

// Import image assets
import logo from '../../public/images/navbar/logo3.png';
import homeIcon from '../../public/images/navbar/remove_11934537.png';
import friendlistIcon from '../../public/images/navbar/friendlist.png';
import addfriendIcon from '../../public/images/navbar/add-friend.png';
import groupslistIcon from '../../public/images/navbar/group.png';
import notificationIcon from '../../public/images/navbar/bell.png';
import chatIcon from '../../public/images/navbar/chat.png';

interface NavItemProps {
  href: string;
  icon: any;
  alt: string;
  label: string;
}

const Navbar: React.FC = () => {
  const { data: session, status } = useSession();
  const [userData, setUserData] = useState<{ profilePicture: string | null } | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/get-updated-field');
        const result = await response.json();
        if (result.success) {
          setUserData(result.data);
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setIsAuthenticated(false);
      }
    };

    fetchUserData();
  }, []);

  const userName = session?.user?.userName;
  const profilePicture = userData?.profilePicture;

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="fixed top-0 left-0 w-full bg-white shadow-lg z-50 lg:initial lg:animate lg:transition"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-3 lg:px-8 py-3 flex justify-between items-center h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center flex-shrink-0">
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
            className="lg:whileHover lg:transition"
          >
            <Image
              src={logo}
              alt="UniChat Logo"
              className="w-18 h-10 sm:w-21 sm:h-14"
            />
          </motion.div>
        </Link>

        {/* Navigation Items */}
        <div className="flex items-center sm:space-x-3 lg:space-x-8 flex-shrink-0">
          <NavItem href="/" icon={homeIcon} alt="Home" label="Home" />
          <NavItem href="/friends" icon={friendlistIcon} alt="Friend List" label="Friends" />
          <NavItem href="/friends/add" icon={addfriendIcon} alt="Add Friend" label="Add Friend" />
          <NavItem href="/groups" icon={groupslistIcon} alt="Groups List" label="Groups" />
        </div>

        {/* Action Items and Profile */}
        <div className="flex items-center sm:space-x-6 flex-shrink-0">
          <ActionNavItem href="/chat" icon={chatIcon} alt="Chat" label="Chat" />
          <ActionNavItem href="/notifications" icon={notificationIcon} alt="Notifications" label="Notifications" />
          {isAuthenticated && (
            <Link href="/profile" className="hidden sm:flex items-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative lg:whileHover lg:whileTap"
              >
                {profilePicture ? (
                  <img
                    src={profilePicture}
                    alt="Profile Picture"
                    className="rounded-full overflow-hidden border border-gray-300 w-10 h-10"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center text-lg font-semibold">
                    {userName ? userName.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
                <motion.span
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="hidden group-hover:lg:block absolute left-1/2 transform -translate-x-1/2 top-full mt-2 bg-gray-800 text-white px-2 py-1 rounded-md text-xs shadow-lg whitespace-nowrap z-50 lg:initial lg:animate lg:transition"
                >
                  Profile
                </motion.span>
              </motion.div>
            </Link>
          )}
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;