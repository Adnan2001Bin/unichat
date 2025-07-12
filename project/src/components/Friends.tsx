"use client";

import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import Loader from "@/components/Loader";

// Interface for a friend (connection)
interface Friend {
  _id: string;
  userName: string;
  profilePicture?: string;
}

// Interface for friends data from the API
interface FriendsData {
  connections: Friend[];
}

// Interface for API response
interface ApiResponse {
  success: boolean;
  data?: FriendsData;
  message?: string;
}

function Friends() {
  const [loading, setLoading] = useState(true);
  const { data: session, status } = useSession();
  const [friendsData, setFriendsData] = useState<FriendsData | null>(null);
 
  console.log(session);
  
  useEffect(() => {
    const fetchFriendsData = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/list_friends_and_pending_requests");
        const result = await response.json() as ApiResponse;
        if (result.success && result.data) {
          setFriendsData(result.data);
        } else {
          toast.error("Error", {
            description: result.message || "Failed to fetch friends data",
            className:
              "bg-red-600 text-white border-red-700 backdrop-blur-md bg-opacity-80",
            duration: 4000,
          });
        }
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Failed to fetch friends data";
        console.error(errorMessage);
        toast.error("Error", {
          description: errorMessage,
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

  if (loading) {
    return <Loader message="Loading friends..." />;
  }

  return (
    <div className="flex gap-30">
      <h1 className="text-sm font-bold font-sans">Friends</h1>
      <p className="text-sm font-bold font-sans">
        {friendsData?.connections.length ?? 0}
      </p>
    </div>
  );
}

export default Friends;