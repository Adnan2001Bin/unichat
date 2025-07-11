'use client';

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, UserPlus, UserCheck, UserX } from "lucide-react";
import Loader from "@/components/Loader";

// Define the new color theme variables based on "Professional & Calming"
const THEME_PRIMARY_DARK_BLUE = '#2C3E50'; // For strong elements, main text, header gradient start, and one blob
const THEME_SECONDARY_BLUE = '#3498DB'; // For main action buttons, header gradient end
const THEME_ACCENT_GREEN = '#2ECC71'; // For "Joined" tag, success states, and one blob
const THEME_BACKGROUND_LIGHT = '#ECF0F1'; // Page background
const THEME_CTA_YELLOW = '#F1C40F'; // For "Add Friend" or primary CTAs, and one blob


function FriendsHub() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "loading") {
    return <Loader message="Loading session..." />;
  }

  if (!session) {
    router.push("/sign-in");
    return null;
  }

  return (
    <div 
      className="min-h-screen p-4 sm:p-6 lg:p-8 mt-15 font-sans relative overflow-hidden" 
      style={{ backgroundColor: THEME_BACKGROUND_LIGHT }}
    >
      {/* Abstract background shapes with adjusted colors - Start */}
      <div
        className="absolute top-0 left-0 w-64 h-64 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"
        style={{ backgroundColor: THEME_PRIMARY_DARK_BLUE }}
      ></div>
      <div
        className="absolute top-0 right-0 w-64 h-64 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"
        style={{ backgroundColor: THEME_ACCENT_GREEN }}
      ></div>
      <div
        className="absolute bottom-0 left-1/4 w-64 h-64 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"
        style={{ backgroundColor: THEME_CTA_YELLOW }}
      ></div>
      {/* Abstract background shapes - End */}

      <div className="max-w-4xl mx-auto relative z-10"> {/* Ensure content is above blobs with z-10 */}
        <Card className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
          <CardHeader className="p-6" style={{ background: `linear-gradient(to right, ${THEME_PRIMARY_DARK_BLUE}, ${THEME_SECONDARY_BLUE})`, color: 'white' }}>
            <CardTitle className="text-3xl font-bold tracking-tight">
              Friends Hub
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Your Friends Button */}
              <Button
                onClick={() => router.push("/friends/list")}
                className="font-semibold py-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-center space-x-2"
                style={{ backgroundColor: THEME_SECONDARY_BLUE, color: 'white' }}
              >
                <Users className="w-6 h-6" />
                <span>Your Friends</span>
              </Button>

              {/* Add Friends Button */}
              <Button
                onClick={() => router.push("/friends/findfriends")}
                className="font-semibold py-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-center space-x-2"
                style={{ backgroundColor: THEME_CTA_YELLOW, color: 'white' }}
              >
                <UserPlus className="w-6 h-6" />
                <span>Add Friends</span>
              </Button>

              {/* Pending Requests (Received) Button */}
              <Button
                onClick={() => router.push("/friends/pending-received")}
                className="font-semibold py-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-center space-x-2"
                style={{ backgroundColor: THEME_ACCENT_GREEN, color: 'white' }}
              >
                <UserCheck className="w-6 h-6" />
                <span>Pending Requests</span>
              </Button>

              {/* Sent Requests Button */}
              <Button
                onClick={() => router.push("/friends/pending-sent")}
                className="font-semibold py-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-center space-x-2"
                style={{ backgroundColor: THEME_PRIMARY_DARK_BLUE, color: 'white' }}
              >
                <UserX className="w-6 h-6" />
                <span>Sent Requests</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default FriendsHub;