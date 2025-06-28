'use client';

import Loader from "@/components/Loader";
import { UserCircle } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function PendingSentRequests() {
  const { data: session, status } = useSession();
  const [friendsData, setFriendsData] = useState<{
    pendingSentRequests: any[];
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
            description: result.message || "Failed to fetch sent requests",
            className:
              "bg-red-600 text-white border-red-700 backdrop-blur-md bg-opacity-80",
            duration: 4000,
          });
        }
      } catch (error) {
        toast.error("Error", {
          description: "Failed to fetch sent requests",
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

  if (status === "loading") {
    return <Loader message="Loading session..." />;
  }

  if (!session) {
    router.push("/sign-in");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-white shadow-xl rounded-2xl overflow-hidden border border-emerald-100">
          <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white p-6">
            <CardTitle className="text-3xl font-bold tracking-tight">
              Sent Friend Requests
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {loading ? (
              <Loader message="Loading sent requests..." />
            ) : (
              <div className="space-y-4">
                {friendsData?.pendingSentRequests.length ? (
                  friendsData.pendingSentRequests.map((user) => (
                    <div
                      key={user._id}
                      className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 ease-in-out"
                    >
                      <div className="flex items-center space-x-4">
                        {user.profilePicture ? (
                          <img
                            src={user.profilePicture}
                            alt={user.userName}
                            className="w-14 h-14 rounded-full border-2 border-emerald-200 object-cover"
                          />
                        ) : (
                          <UserCircle className="w-14 h-14 text-emerald-500" />
                        )}
                        <div>
                          <p className="text-lg font-semibold text-gray-800">
                            {user.userName}
                          </p>
                          {user.university && (
                            <p className="text-sm text-gray-600">{user.university}</p>
                          )}
                          {user.headline && (
                            <p className="text-sm text-gray-500 italic">{user.headline}</p>
                          )}
                        </div>
                      </div>
                      <span className="text-emerald-600 font-semibold">Pending</span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600 text-lg">
                      No sent friend requests
                    </p>
                    <button
                      onClick={() => router.push("/friends/add")}
                      className="mt-4 inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-300"
                    >
                      Find Friends
                    </button>
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

export default PendingSentRequests;