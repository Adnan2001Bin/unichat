'use client';

import Loader from "@/components/Loader";
import { Trash, UserCircle } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Define the new color theme variables based on "Professional & Calming"
const THEME_PRIMARY_DARK_BLUE = '#2C3E50'; // For strong elements, main text, header gradient start, and one blob
const THEME_SECONDARY_BLUE = '#3498DB'; // For main action buttons, header gradient end, and one blob
const THEME_ACCENT_GREEN = '#2ECC71'; // For "Joined" tag, success states, and one blob
const THEME_BACKGROUND_LIGHT = '#ECF0F1'; // Page background
const THEME_TEXT_DARK = '#2C3E50'; // Main dark text
const THEME_TEXT_LIGHT = '#7F8C8D'; // Secondary light text
const THEME_CTA_YELLOW = '#F1C40F'; // For "Add Friend" or primary CTAs, and one blob

// No specific hover variables needed when using direct Tailwind classes like hover:bg-blue-600

function FriendList() {
  const { data: session, status } = useSession();
  const [friendsData, setFriendsData] = useState<{
    connections: any[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchFriendsData = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/list_friends_and_pending_requests");
        const result = await response.json();
        if (result.success) {
          setFriendsData(result.data);
        } else {
          toast.error("Error", {
            description: result.message || "Failed to fetch friends data",
            className:
              "bg-red-600 text-white border-red-700 backdrop-blur-md bg-opacity-80",
            duration: 4000,
          });
        }
      } catch (error) {
        toast.error("Error", {
          description: "Failed to fetch friends data",
          className:
            "bg-red-600 text-white border-red-700 backdrop-blur-md bg-opacity-80",
          duration: 4000,
        });
      } finally {
        setLoading(false);
      }
    };

    if (status === "authenticated") {
      fetchFriendsData();
    }
  }, [status]);

  const handleRemoveFriend = async (friendId: string) => {
    try {
      const response = await fetch('/api/remove-friend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendId }),
      });
      const result = await response.json();
      if (result.success) {
        toast.success('Success', {
          description: result.message,
          className: 'bg-green-600 text-white border-green-700 backdrop-blur-md bg-opacity-80',
          duration: 4000,
        });
        setFriendsData((prev) =>
          prev
            ? {
                ...prev,
                connections: prev.connections.filter(
                  (user) => user._id !== friendId
                ),
              }
            : prev
        );
      } else {
        toast.error('Error', {
          description: result.message,
          className: 'bg-red-600 text-white border-red-700 backdrop-blur-md bg-opacity-80',
          duration: 4000,
        });
      }
    } catch (error) {
      toast.error('Error', {
        description: 'Failed to remove friend',
        className: 'bg-red-600 text-white border-red-700 backdrop-blur-md bg-opacity-80',
        duration: 4000,
      });
    }
  };

  if (status === "loading") {
    return <Loader message="Loading session..." />;
  }

  if (!session) {
    router.push("/sign-in");
    return null;
  }

  return (
    <div 
      className="min-h-screen p-4 sm:p-6 lg:p-8 font-sans relative overflow-hidden" 
      style={{ backgroundColor: THEME_BACKGROUND_LIGHT }}
    >
      {/* Abstract background shapes with adjusted colors */}
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

      <div className="max-w-4xl mx-auto relative z-10 mt-15"> {/* Ensure content is above blobs with z-10 */}
        <Card className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
          <CardHeader className="p-6" style={{ background: `linear-gradient(to right, ${THEME_PRIMARY_DARK_BLUE}, ${THEME_SECONDARY_BLUE})`, color: 'white' }}>
            <CardTitle className="text-3xl font-bold tracking-tight">
              Your Friends
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {loading ? (
              <Loader message="Loading friends..." />
            ) : (
              <div className="space-y-4">
                {friendsData?.connections.length ? (
                  friendsData.connections.map((user) => (
                    <div
                      key={user._id}
                      className="flex items-center justify-between p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 ease-in-out"
                      style={{ backgroundColor: 'white', border: `1px solid ${THEME_BACKGROUND_LIGHT}` }}
                    >
                      <div className="flex items-center space-x-4">
                        {user.profilePicture ? (
                          <img
                            src={user.profilePicture}
                            alt={user.userName}
                            className="w-14 h-14 rounded-full border-2 object-cover"
                            style={{ borderColor: THEME_SECONDARY_BLUE }}
                          />
                        ) : (
                          <UserCircle className="w-14 h-14" style={{ color: THEME_SECONDARY_BLUE }} />
                        )}
                        <div>
                          <p className="text-lg font-semibold" style={{ color: THEME_TEXT_DARK }}>
                            {user.userName}
                          </p>
                          {user.university && (
                            <p className="text-sm" style={{ color: THEME_TEXT_LIGHT }}>{user.university}</p>
                          )}
                          {user.headline && (
                            <p className="text-sm italic" style={{ color: THEME_TEXT_LIGHT }}>{user.headline}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => toast.info("Feature coming soon!", {
                            description: `View ${user.userName}'s profile (under development)`,
                            className:
                              "bg-blue-600 text-white border-blue-700 backdrop-blur-md bg-opacity-80",
                            duration: 4000,
                          })}
                          className="font-semibold transition-colors duration-200 text-blue-500 hover:text-blue-600" // Tailwind colors for hover
                          style={{ backgroundColor: 'transparent', border: 'none' }}
                        >
                          View Profile
                        </button>
                        <Button
                          onClick={() => handleRemoveFriend(user._id)}
                          className="text-white font-semibold py-2 px-3 rounded-lg flex items-center space-x-1 transition-all duration-200 bg-gray-500 hover:bg-gray-600" // Tailwind colors for bg and hover
                          title="Remove Friend"
                        >
                          <Trash className="w-4 h-4" />
                          <span>Unfriend</span>
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-lg" style={{ color: THEME_TEXT_LIGHT }}>
                      No friends yet. Start connecting!
                    </p>
                    <Button
                      onClick={() => router.push("/friends/findfriends")}
                      className="mt-4 inline-block font-semibold py-2 px-6 rounded-lg transition-all duration-300 bg-yellow-500 hover:bg-yellow-600 text-white" // Tailwind colors for bg and hover
                    >
                      Add Friends
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default FriendList;