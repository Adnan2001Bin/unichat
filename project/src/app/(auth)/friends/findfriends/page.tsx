"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";
import Image from "next/image"; // Import Image from next/image
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UserCircle, UserPlus, UserCheck, UserX } from "lucide-react";
import Loader from "@/components/Loader";

// Define the new color theme variables based on "Professional & Calming"
const THEME_PRIMARY_DARK_BLUE = "#2C3E50";
const THEME_SECONDARY_BLUE = "#3498DB";
const THEME_ACCENT_GREEN = "#2ECC71";
const THEME_BACKGROUND_LIGHT = "#ECF0F1";
const THEME_TEXT_DARK = "#2C3E50";
const THEME_TEXT_LIGHT = "#7F8C8D";
const THEME_CTA_YELLOW = "#F1C40F";

const searchSchema = z.object({
  query: z.string().min(1, "Search query is required").trim(),
});

type SearchInput = z.infer<typeof searchSchema>;

// Interface for a user in search results
interface SearchUser {
  _id: string;
  userName: string;
  profilePicture?: string;
  university?: string;
  headline?: string;
}

// Interface for a user in friends data
interface FriendUser {
  _id: string;
  userName: string;
  profilePicture?: string;
  university?: string;
  headline?: string;
}

// Interface for the friends data structure
interface FriendsData {
  connections: FriendUser[];
  pendingSentRequests: FriendUser[];
  pendingReceivedRequests: FriendUser[];
}

export default function AddFriendPage() {
  const { data: session, status } = useSession();
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [friendsData, setFriendsData] = useState<FriendsData | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const form = useForm<SearchInput>({
    resolver: zodResolver(searchSchema),
    defaultValues: { query: "" },
  });

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
        console.error(error);
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

  const onSearch = async (data: SearchInput) => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/friendSearch?query=${encodeURIComponent(data.query)}`
      );
      const result = await response.json();
      if (result.success) {
        setSearchResults(result.data);
      } else {
        toast.error("Error", {
          description: result.message || "Failed to search users",
          className:
            "bg-red-600 text-white border-red-700 backdrop-blur-md bg-opacity-80",
          duration: 4000,
        });
      }
    } catch (error) {
      console.error(error);
      toast.error("Error", {
        description: "Failed to search users",
        className:
          "bg-red-600 text-white border-red-700 backdrop-blur-md bg-opacity-80",
        duration: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async (recipientId: string) => {
    try {
      const response = await fetch("/api/send-friend-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipientId }),
      });
      const result = await response.json();
      if (result.success) {
        toast.success("Success", {
          description: result.message,
          className:
            "bg-green-600 text-white border-green-700 backdrop-blur-md bg-opacity-80",
          duration: 4000,
        });
        form.reset();
        setSearchResults([]);
        setFriendsData((prev) =>
          prev
            ? {
                ...prev,
                pendingSentRequests: [
                  ...prev.pendingSentRequests,
                  { _id: recipientId } as FriendUser,
                ],
              }
            : prev
        );
      } else {
        toast.error("Error", {
          description: result.message,
          className:
            "bg-red-600 text-white border-red-700 backdrop-blur-md bg-opacity-80",
          duration: 4000,
        });
      }
    } catch (error) {
      console.error(error);
      toast.error("Error", {
        description: "Failed to send friend request",
        className:
          "bg-red-600 text-white border-red-700 backdrop-blur-md bg-opacity-80",
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
      className="min-h-screen p-4 sm:p-6 lg:p-8 mt-15 font-sans relative overflow-hidden"
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

      <div className="max-w-4xl mx-auto relative z-10">
        <Card className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
          <CardHeader
            className="p-6"
            style={{
              background: `linear-gradient(to right, ${THEME_PRIMARY_DARK_BLUE}, ${THEME_SECONDARY_BLUE})`,
              color: "white",
            }}
          >
            <CardTitle className="text-3xl font-bold tracking-tight">
              Add Friends
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {loading ? (
              <Loader message="Searching users..." />
            ) : (
              <>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSearch)}
                    className="space-y-4"
                  >
                    <FormField
                      control={form.control}
                      name="query"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel
                            className="font-medium"
                            style={{ color: THEME_TEXT_DARK }}
                          >
                            Search Users
                          </FormLabel>
                          <div className="flex space-x-2">
                            <FormControl>
                              <Input
                                placeholder="Enter username"
                                {...field}
                                className="border rounded-lg p-2.5 w-full bg-gray-50 placeholder-gray-400"
                                style={
                                  {
                                    color: THEME_TEXT_DARK,
                                    borderColor: THEME_TEXT_LIGHT,
                                    "--tw-focus-ring-color": `${THEME_SECONDARY_BLUE}33`,
                                  } as React.CSSProperties
                                }
                              />
                            </FormControl>
                            <Button
                              type="submit"
                              disabled={loading}
                              className="font-semibold py-2 px-4 rounded-lg transition-all duration-200 bg-blue-500 hover:bg-blue-600 text-white"
                            >
                              {loading ? "Searching..." : "Search"}
                            </Button>
                          </div>
                          <FormMessage className="text-red-500 text-sm mt-1" />
                        </FormItem>
                      )}
                    />
                  </form>
                </Form>
                <div className="mt-6 space-y-4">
                  {searchResults.map((user) => {
                    const isFriend = friendsData?.connections.some(
                      (friend) => friend._id.toString() === user._id
                    );
                    const isPendingSent = friendsData?.pendingSentRequests.some(
                      (req) => req._id.toString() === user._id
                    );
                    const isPendingReceived =
                      friendsData?.pendingReceivedRequests.some(
                        (req) => req._id.toString() === user._id
                      );

                    return (
                      <div
                        key={user._id}
                        className="flex items-center justify-between p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 ease-in-out animate-fade-in"
                        style={{
                          backgroundColor: "white",
                          border: `1px solid ${THEME_BACKGROUND_LIGHT}`,
                        }}
                      >
                        <div className="flex items-center space-x-4">
                          {user.profilePicture ? (
                            <div className="relative w-14 h-14">
                              <Image
                                src={user.profilePicture}
                                alt={user.userName}
                                fill
                                className="rounded-full border-2 object-cover"
                                style={{ borderColor: THEME_SECONDARY_BLUE }}
                              />
                            </div>
                          ) : (
                            <UserCircle
                              className="w-14 h-14"
                              style={{ color: THEME_SECONDARY_BLUE }}
                            />
                          )}
                          <div>
                            <p
                              className="text-lg font-semibold"
                              style={{ color: THEME_TEXT_DARK }}
                            >
                              {user.userName}
                            </p>
                            {user.university && (
                              <p
                                className="text-sm"
                                style={{ color: THEME_TEXT_LIGHT }}
                              >
                                {user.university}
                              </p>
                            )}
                            {user.headline && (
                              <p
                                className="text-sm italic"
                                style={{ color: THEME_TEXT_LIGHT }}
                              >
                                {user.headline}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {isFriend ? (
                            <span
                              className="flex items-center font-semibold"
                              style={{ color: THEME_ACCENT_GREEN }}
                            >
                              <UserCheck className="w-5 h-5 mr-1" /> Friend
                            </span>
                          ) : isPendingSent ? (
                            <span
                              className="flex items-center font-semibold"
                              style={{ color: THEME_SECONDARY_BLUE }}
                            >
                              <UserPlus className="w-5 h-5 mr-1" /> Request Sent
                            </span>
                          ) : isPendingReceived ? (
                            <span
                              className="flex items-center font-semibold"
                              style={{ color: THEME_PRIMARY_DARK_BLUE }}
                            >
                              <UserX className="w-5 h-5 mr-1" /> Request
                              Received
                            </span>
                          ) : (
                            <Button
                              onClick={() => handleSendRequest(user._id)}
                              className="font-semibold py-2 px-4 rounded-lg transition-all duration-200 bg-yellow-500 hover:bg-yellow-600 text-white"
                            >
                              Send Friend Request
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {searchResults.length === 0 &&
                    !loading &&
                    form.formState.isSubmitted && (
                      <p
                        className="text-center text-lg py-8 animate-fade-in"
                        style={{ color: THEME_TEXT_LIGHT }}
                      >
                        No users found
                      </p>
                    )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}