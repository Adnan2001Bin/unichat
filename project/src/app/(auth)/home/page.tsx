"use client";

import React from "react";
import { useSession } from "next-auth/react";
import HomePosts from "@/components/HomePosts";
import Loader from "@/components/Loader";
import ProfileHome from "@/components/ProfileHome";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Sparkles, Lightbulb } from "lucide-react"; 

// Define the new color theme variables (copied from previous components for consistency)
const THEME_PRIMARY_DARK_BLUE = '#2C3E50'; // For strong elements, main text, header gradient start, and one blob
const THEME_SECONDARY_BLUE = '#3498DB'; // For main action buttons, header gradient end, and one blob
const THEME_ACCENT_GREEN = '#2ECC71'; // For success states, and one blob
const THEME_BACKGROUND_LIGHT = '#ECF0F1'; // Base light background color
const THEME_TEXT_DARK = '#2C3E50'; // Main dark text
const THEME_TEXT_LIGHT = '#7F8C8D'; // Secondary light text
const THEME_CTA_YELLOW = '#F1C40F'; // For one blob (can be used for a specific CTA if needed)

// Background pattern for a unique look
const THEME_BACKGROUND_PATTERN_SVG = `url("data:image/svg+xml,%3Csvg width='6' height='6' viewBox='0 0 6 6' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%239C92AC' fill-opacity='0.15' fill-rule='evenodd'%3E%3Cpath d='M5 0h1L0 6V5zm1 6v-1L1 0h1z'/%3E%3C/g%3E%3C/svg%3E")`;


const Home: React.FC = () => {
  const { status } = useSession();

  if (status === "loading") {
    return <Loader message="Loading UniConnect..." />; // More specific loader message
  }

  if (status !== "authenticated") {
    return (
      <div 
        className="min-h-screen flex flex-col items-center justify-center relative" 
        style={{ 
          backgroundColor: THEME_BACKGROUND_LIGHT, // Fallback color
          backgroundImage: THEME_BACKGROUND_PATTERN_SVG, // Subtle pattern
          backgroundAttachment: 'fixed', // Makes pattern fixed while scrolling content
        }}
      >
        {/* Animated background shapes - larger and more spread out */}
        <div className="absolute top-0 left-0 w-80 h-80 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob" style={{ backgroundColor: THEME_PRIMARY_DARK_BLUE }}></div>
        <div className="absolute top-1/4 right-0 w-96 h-96 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000" style={{ backgroundColor: THEME_ACCENT_GREEN }}></div>
        <div className="absolute bottom-0 left-1/2 w-80 h-80 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000" style={{ backgroundColor: THEME_CTA_YELLOW }}></div>
        <div className="absolute bottom-1/4 left-0 w-72 h-72 rounded-full mix-blend-multiply filter blur-xl opacity-25 animate-blob animation-delay-6000" style={{ backgroundColor: THEME_SECONDARY_BLUE }}></div>


        <Card className="max-w-lg w-full shadow-2xl rounded-xl relative z-10" style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)' }}>
          <CardContent className="p-8 text-center">
            <h1 className="text-4xl font-extrabold mb-4 tracking-tight" style={{ color: THEME_TEXT_DARK }}>
              Welcome to <span className="text-transparent bg-clip-text" style={{ backgroundImage: `linear-gradient(to right, ${THEME_SECONDARY_BLUE}, ${THEME_ACCENT_GREEN})` }}>UniConnect</span>
            </h1>
            <p className="text-lg mb-8 leading-relaxed" style={{ color: THEME_TEXT_LIGHT }}>
              Your hub for students to connect, collaborate, and thrive.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/sign-in" passHref>
                <Button className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg">
                  Sign In
                </Button>
              </Link>
              <Link href="/sign-up" passHref>
                <Button className="w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg">
                  Join UniConnect
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen pt-20 pb-8 px-4 sm:px-6 lg:px-8 font-sans relative" 
      style={{ 
        backgroundColor: THEME_BACKGROUND_LIGHT, // Fallback color
        backgroundImage: THEME_BACKGROUND_PATTERN_SVG, // Subtle pattern
        backgroundAttachment: 'fixed', // Makes pattern fixed while scrolling content
      }}
    >
      {/* Animated background shapes - larger and more spread out */}
      <div className="absolute top-0 left-0 w-80 h-80 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob" style={{ backgroundColor: THEME_PRIMARY_DARK_BLUE }}></div>
      <div className="absolute top-1/4 right-0 w-96 h-96 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000" style={{ backgroundColor: THEME_ACCENT_GREEN }}></div>
      <div className="absolute bottom-0 left-1/2 w-80 h-80 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000" style={{ backgroundColor: THEME_CTA_YELLOW }}></div>
      <div className="absolute bottom-1/4 left-0 w-72 h-72 rounded-full mix-blend-multiply filter blur-xl opacity-25 animate-blob animation-delay-6000" style={{ backgroundColor: THEME_SECONDARY_BLUE }}></div>


      <div className="container mx-auto grid grid-cols-1 lg:grid-cols-[1fr_2fr_1fr] gap-6 max-w-7xl relative z-10"> {/* Custom grid column widths */}
        {/* Left Column: ProfileHome */}
        <aside className="lg:col-span-1 w-full lg:sticky lg:top-24 h-fit">
          <ProfileHome />
        </aside>

        {/* Middle Column: HomePosts (Main Feed) */}
        <main className="lg:col-span-1 w-full"> {/* This column will take 2fr from the custom grid, as it's the second child */}
          <HomePosts />
        </main>

        {/* Right Column: New Inspirational Section (only visible on xl screens and above) */}
        <aside className="hidden lg:block lg:col-span-1 w-full lg:sticky lg:top-24 h-fit"> {/* This column will take 1fr */}
          <Card className="bg-white shadow-xl rounded-xl p-6 border border-gray-100">
            <CardContent className="p-0">
              <h3 className="font-bold text-xl mb-4 flex items-center gap-2" style={{ color: THEME_TEXT_DARK }}>
                <Sparkles className="h-6 w-6" style={{ color: THEME_CTA_YELLOW }} />
                Daily Inspiration
              </h3>
              <p className="text-lg italic leading-relaxed" style={{ color: THEME_TEXT_DARK }}>
                &quot;The beautiful thing about learning is that no one can take it away from you.&quot;
              </p>
              <p className="text-right text-sm mt-2" style={{ color: THEME_TEXT_LIGHT }}>
                — B.B. King
              </p>
              <hr className="my-4 border-gray-100" />
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2" style={{ color: THEME_TEXT_DARK }}>
                <Lightbulb className="h-5 w-5" style={{ color: THEME_ACCENT_GREEN }} />
                Student Tip
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: THEME_TEXT_LIGHT}}>
                &quot;Don&apos;t just study to pass, study to understand. Active recall and spaced repetition are your best friends!&quot;
              </p>
            </CardContent>
          </Card>
          {/* You could add more sections here like trending topics, suggested groups, etc. */}
        </aside>
      </div>
    </div>
  );
};

export default Home;