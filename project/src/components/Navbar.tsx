"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useSession, signOut } from "next-auth/react";
import NavItem from "./NavItems";
import { toast } from "sonner";

// Import image assets
import logo from "../../public/images/navbar/logo3.png";
import homeIcon from "../../public/images/navbar/remove_11934537.png";
import friendlistIcon from "../../public/images/navbar/friendlist.png";
import addfriendIcon from "../../public/images/navbar/add-friend.png";
import groupslistIcon from "../../public/images/navbar/group.png";
import notificationIcon from "../../public/images/navbar/bell.png";
import chatIcon from "../../public/images/navbar/chat.png";
import signOutIcon from "../../public/images/navbar/exit.png";

const Navbar: React.FC = () => {
  const { data: session, status } = useSession();
  const [userData, setUserData] = useState<{
    profilePicture: string | null;
  } | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Fetch user data when status changes
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/get-updated-field");
        const result = await response.json();
        if (result.success) {
          setUserData(result.data);
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          setUserData(null);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setIsAuthenticated(false);
        setUserData(null);
      }
    };

    if (status === "authenticated") {
      fetchUserData();
    } else {
      setIsAuthenticated(false);
      setUserData(null);
    }
  }, [status]);

  const userName = session?.user?.userName;
  const profilePicture = userData?.profilePicture;

  const handleSignOut = async () => {
    try {
      // Call the sign-out API endpoint
      const response = await fetch("/api/sign-out", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const result = await response.json();

      if (result.success) {
        // Perform client-side sign-out with NextAuth
        await signOut({ callbackUrl: "/sign-in" });
        toast.success("Signed out successfully", {
          className:
            "bg-green-600 text-white border-green-700 backdrop-blur-md bg-opacity-80",
          duration: 4000,
        });
      } else {
        throw new Error(result.message || "Failed to sign out");
      }
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Error", {
        description: "Failed to sign out",
        className:
          "bg-red-600 text-white border-red-700 backdrop-blur-md bg-opacity-80",
        duration: 4000,
      });
    }
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed top-0 left-0 w-full bg-white shadow-lg z-50"
    >
      {/* Mobile/Small Screen Layout (sm) - Two lines */}
      <div className="sm:hidden">
        {/* First line - Logo and User Controls */}
        <div className="mx-auto px-3 py-2 flex justify-between items-center h-14">
          <Link href="/home" className="flex items-center flex-shrink-0">
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <Image
                src={logo}
                alt="UniChat Logo"
                className="w-14 h-9 sm:w-21 sm:h-14"
              />
            </motion.div>
          </Link>

          <div className="flex items-center space-x-4">
            {isAuthenticated && (
              <>
                <Link href="/profile" className="flex items-center">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative"
                  >
                    {profilePicture ? (
                      <img
                        src={profilePicture}
                        alt="Profile Picture"
                        className="rounded-full overflow-hidden border border-gray-300 w-10 h-10"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center text-lg font-semibold">
                        {userName ? userName.charAt(0).toUpperCase() : "U"}
                      </div>
                    )}
                  </motion.div>
                </Link>

                <div className="flex items-center px-1 py-2 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-300 group">
                  <Image
                    src={signOutIcon}
                    alt="Sign Out"
                    onClick={handleSignOut}
                    className="w-7 h-7 object-contain transition-transform duration-300"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Second line - Navigation Items */}
        <div className="bg-white border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-3 py-1 flex justify-center items-center overflow-x-auto">
            <div className="flex space-x-2">
              <NavItem href="/" icon={homeIcon} alt="Home" label="Home" />
              <NavItem
                href="/friends"
                icon={friendlistIcon}
                alt="Friend List"
                label="Friends"
              />
              <NavItem
                href="/friends/findfriends"
                icon={addfriendIcon}
                alt="Add Friend"
                label="Add Friend"
              />
              <NavItem
                href="/groups"
                icon={groupslistIcon}
                alt="Groups List"
                label="Groups"
              />
              <NavItem href="/chat" icon={chatIcon} alt="Chat" label="Chat" />
              <NavItem
                href="/notifications"
                icon={notificationIcon}
                alt="Notifications"
                label="Notifications"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Original Layout for Medium and Large Screens (md and lg) */}
      <div className="hidden sm:block">
        <div className="max-w-7xl mx-auto px-3 sm:px-3 lg:px-8 py-3 flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/home" className="flex items-center flex-shrink-0">
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
            <NavItem
              href="/friends"
              icon={friendlistIcon}
              alt="Friend List"
              label="Friends"
            />
            <NavItem
              href="/friends/findfriends"
              icon={addfriendIcon}
              alt="Add Friend"
              label="Add Friend"
            />
            <NavItem
              href="/groups"
              icon={groupslistIcon}
              alt="Groups List"
              label="Groups"
            />
            <NavItem href="/chat" icon={chatIcon} alt="Chat" label="Chat" />
            <NavItem
              href="/notifications"
              icon={notificationIcon}
              alt="Notifications"
              label="Notifications"
            />
          </div>

          <div className="flex items-center sm:space-x-6 flex-shrink-0">
            {isAuthenticated && (
              <>
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
                        {userName ? userName.charAt(0).toUpperCase() : "U"}
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

                <div className="flex items-center px-1 py-2 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-300 group ">
                  <Image
                    src={signOutIcon}
                    alt="Sign Out"
                    onClick={handleSignOut}
                    className="w-7 h-7 md:w-8 md:h-8 object-contain transition-transform duration-300 group-hover:lg:scale-110"
                  />
                  <motion.span
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="hidden group-hover:lg:block absolute transform -translate-x-1/2 top-full mt-2 bg-gray-800 text-white px-2 py-1 rounded-md text-xs shadow-lg whitespace-nowrap z-50 lg:initial lg:animate lg:transition"
                  >
                    Sign-Out
                  </motion.span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
