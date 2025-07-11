"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  ImageIcon,
  Users,
  PlusCircle,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import Loader from "@/components/Loader";
import Link from "next/link";

// Define the new color theme variables based on "Professional & Calming"
const THEME_PRIMARY_DARK_BLUE = "#2C3E50"; // For strong elements, main text, "Creator" tag, and one blob
const THEME_SECONDARY_BLUE = "#3498DB"; // For main action buttons like Search, pagination, and one blob
const THEME_ACCENT_GREEN = "#2ECC71"; // For "Joined" tag, approve buttons, and one blob
const THEME_BACKGROUND_LIGHT = "#ECF0F1"; // Page background
const THEME_TEXT_DARK = "#2C3E50"; // Main dark text (matches primary dark blue for consistency)
const THEME_TEXT_LIGHT = "#7F8C8D"; // Secondary light text for descriptions, etc.
const THEME_CTA_YELLOW = "#F1C40F"; // For "Create New Group", "Join Group", "Request to Join", and one blob

// No specific hover variables needed when using direct Tailwind classes like hover:bg-blue-600

interface Group {
  _id: string;
  name: string;
  description: string;
  coverImage?: string;
  privacy: "public" | "private";
  creator: { _id: string; userName: string };
  memberCount: number;
  isMember: boolean;
}

interface PendingRequest {
  groupId: string;
  groupName: string;
  pendingUsers: { userId: string; userName: string }[];
}

const GroupsPage: React.FC = () => {
  const { status, data: session } = useSession();
  const router = useRouter();
  const [groups, setGroups] = useState<Group[]>([]);
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchGroups = async (query: string = "", page: number = 1) => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/groups?query=${encodeURIComponent(query)}&page=${page}&limit=10`
      );
      const result = await response.json();
      if (result.success) {
        setGroups(result.data);
        setTotalPages(result.pagination.totalPages);
      } else {
        toast.error(result.message || "Failed to fetch groups", {
          className:
            "bg-red-600 text-white border-red-700 backdrop-blur-md bg-opacity-80",
          duration: 4000,
        });
      }
    } catch (error) {
      console.error(error);
      toast.error("Error fetching groups", {
        className:
          "bg-red-600 text-white border-red-700 backdrop-blur-md bg-opacity-80",
        duration: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingRequests = async () => {
    try {
      const response = await fetch("/api/groups/requests");
      const result = await response.json();
      if (result.success) {
        setPendingRequests(result.data);
      } else {
        toast.error(result.message || "Failed to fetch pending requests", {
          className:
            "bg-red-600 text-white border-red-700 backdrop-blur-md bg-opacity-80",
          duration: 4000,
        });
      }
    } catch (error) {
      console.error(error);
      toast.error("Error fetching pending requests", {
        className:
          "bg-red-600 text-white border-red-700 backdrop-blur-md bg-opacity-80",
        duration: 4000,
      });
    }
  };

  const handleManageRequest = async (
    groupId: string,
    userId: string,
    action: "approve" | "reject"
  ) => {
    try {
      const response = await fetch("/api/groups/requests/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupId, userId, action }),
      });
      const result = await response.json();
      if (result.success) {
        toast.success(result.message, {
          className:
            "bg-green-600 text-white border-green-700 backdrop-blur-md bg-opacity-80",
          duration: 4000,
        });
        fetchPendingRequests();
        fetchGroups(searchQuery, page);
      } else {
        toast.error(result.message || `Failed to ${action} request`, {
          className:
            "bg-red-600 text-white border-red-700 backdrop-blur-md bg-opacity-80",
          duration: 4000,
        });
      }
    } catch (error) {
      console.error(error);
      toast.error(`Error ${action}ing request`, {
        className:
          "bg-red-600 text-white border-red-700 backdrop-blur-md bg-opacity-80",
        duration: 4000,
      });
    }
  };

  const handleJoinGroup = async (
    groupId: string,
    privacy: "public" | "private"
  ) => {
    try {
      const response = await fetch("/api/groups/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupId,
          action: privacy === "public" ? "join" : "request",
        }),
      });
      const result = await response.json();
      if (result.success) {
        toast.success(result.message, {
          className:
            "bg-green-600 text-white border-green-700 backdrop-blur-md bg-opacity-80",
          duration: 4000,
        });
        fetchGroups(searchQuery, page);
        fetchPendingRequests();
      } else {
        toast.error(result.message || "Failed to join group", {
          className:
            "bg-red-600 text-white border-red-700 backdrop-blur-md bg-opacity-80",
          duration: 4000,
        });
      }
    } catch (error) {
      console.error(error);
      toast.error("Error joining group", {
        className:
          "bg-red-600 text-white border-red-700 backdrop-blur-md bg-opacity-80",
        duration: 4000,
      });
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchGroups();
      fetchPendingRequests();
    }
  }, [status]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchGroups(searchQuery, 1);
  };

  if (status === "loading" || loading) {
    return <Loader message="Summoning student communities..." />;
  }

  if (status === "unauthenticated") {
    router.push("/sign-in");
    return null;
  }

  const joinedGroups = groups.filter((group) => group.isMember);
  const createdGroups = groups.filter(
    (group) => group.creator.userName === session?.user?.userName
  );

  return (
    <div
      className="min-h-screen p-4 sm:p-6 md:p-8 mt-16 font-sans relative overflow-hidden"
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

      <Card
        className="max-w-7xl mx-auto rounded-3xl shadow-2xl relative z-10 p-6 sm:p-8 md:p-10"
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          backdropFilter: "blur(10px)",
        }} // Still slightly transparent white for card bg
      >
        <CardContent className="p-0">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-10 gap-6">
            <h1
              className="text-4xl font-extrabold text-center sm:text-left"
              style={{ color: THEME_TEXT_DARK }}
            >
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: `linear-gradient(to right, ${THEME_PRIMARY_DARK_BLUE}, ${THEME_ACCENT_GREEN})`,
                }}
              >
                Student Connect
              </span>{" "}
              Groups
            </h1>
            <Button
              onClick={() => router.push("/groups/create")}
              className="py-3 px-8 rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-yellow-500 hover:bg-yellow-600 text-white" // Tailwind colors for bg and hover
            >
              <PlusCircle className="inline-block mr-2" size={24} /> Create New
              Group
            </Button>
          </div>

          {/* Search Bar with modern styling */}
          <form
            onSubmit={handleSearch}
            className="mb-10 flex flex-col sm:flex-row gap-4"
          >
            <div className="relative flex-1">
              <Search
                className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 w-6 h-6"
                style={{ color: THEME_TEXT_LIGHT }}
              />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Uncover study groups, clubs, and communities..."
                className="pl-14 py-4 rounded-full border-2 border-gray-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all bg-white text-lg shadow-md w-full"
                style={
                  {
                    color: THEME_TEXT_DARK,
                    borderColor: THEME_TEXT_LIGHT,
                    "--tw-focus-ring-color": `${THEME_SECONDARY_BLUE}33`,
                  } as React.CSSProperties
                }
              />
            </div>
            <Button
              type="submit"
              className="py-3 px-10 rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-blue-500 hover:bg-blue-600 text-white" // Tailwind colors for bg and hover
            >
              Search
            </Button>
          </form>

          {/* Pending Group Requests Section */}
          {pendingRequests.length > 0 && (
            <>
              <div className="border-t border-gray-200 pt-10 mt-10"></div>
              <h2
                className="text-3xl font-bold mb-8 text-center"
                style={{ color: THEME_TEXT_DARK }}
              >
                Requests Awaiting Your Review
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {pendingRequests.map((request) => (
                  <Card
                    key={request.groupId}
                    className="bg-white shadow-xl rounded-2xl border border-gray-100 transform hover:scale-103 transition-transform duration-300"
                  >
                    <CardContent className="p-6">
                      <h3
                        className="text-2xl font-bold mb-4"
                        style={{ color: THEME_TEXT_DARK }}
                      >
                        {request.groupName}
                      </h3>
                      {request.pendingUsers.length === 0 ? (
                        <p className="text-gray-500 italic text-center py-4">
                          No pending requests
                        </p>
                      ) : (
                        <ul className="space-y-4">
                          {request.pendingUsers.map((user) => (
                            <li
                              key={user.userId}
                              className="flex flex-col sm:flex-row justify-between items-center bg-gray-50 p-4 rounded-xl shadow-inner border border-gray-100"
                            >
                              <p
                                className="text-lg font-medium"
                                style={{ color: THEME_TEXT_LIGHT }}
                              >
                                {user.userName}
                              </p>
                              <div className="flex gap-3 mt-3 sm:mt-0">
                                <Button
                                  onClick={() =>
                                    handleManageRequest(
                                      request.groupId,
                                      user.userId,
                                      "approve"
                                    )
                                  }
                                  className="py-2 px-5 rounded-full text-sm font-semibold flex items-center shadow-md hover:shadow-lg transition-all duration-200 bg-emerald-500 hover:bg-emerald-600 text-white" // Tailwind colors for bg and hover
                                >
                                  <CheckCircle2 size={18} className="mr-1" />{" "}
                                  Approve
                                </Button>
                                <Button
                                  onClick={() =>
                                    handleManageRequest(
                                      request.groupId,
                                      user.userId,
                                      "reject"
                                    )
                                  }
                                  className="py-2 px-5 rounded-full text-sm font-semibold flex items-center text-white shadow-md hover:shadow-lg transition-all duration-200 bg-red-500 hover:bg-red-600" // Tailwind colors for bg and hover
                                >
                                  <XCircle size={18} className="mr-1" /> Reject
                                </Button>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}

          {/* Groups You've Joined Section */}
          <div className="border-t border-gray-200 pt-10 mt-10"></div>
          <h2
            className="text-3xl font-bold mb-8 text-center"
            style={{ color: THEME_TEXT_DARK }}
          >
            Your Active Communities
          </h2>
          {joinedGroups.length === 0 ? (
            <p
              className="text-center py-12 text-xl bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 mb-12 animate-fade-in"
              style={{ color: THEME_TEXT_LIGHT }}
            >
              You haven't joined any groups yet. Dive into "Discover More
              Groups" to find your tribe!
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {joinedGroups.map((group) => (
                <Card
                  key={group._id}
                  className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100 group transform hover:scale-103 transition-transform duration-300 relative animate-fade-in-up"
                >
                  <Link href={`/groups/${group._id}`} className="block">
                    <div className="h-48 w-full bg-gray-100 relative overflow-hidden">
                      {group.coverImage ? (
                        <img
                          src={group.coverImage}
                          alt={group.name}
                          className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
                        />
                      ) : (
                        <div
                          className="w-full h-full flex items-center justify-center text-gray-600"
                          style={{ backgroundColor: THEME_PRIMARY_DARK_BLUE }}
                        >
                          <ImageIcon className="h-20 w-20 text-white opacity-70" />
                          <div className="absolute inset-0 bg-black opacity-10"></div>
                        </div>
                      )}
                      <div
                        className="absolute bottom-3 right-3 bg-white text-xs font-semibold px-3 py-1 rounded-full shadow-md flex items-center"
                        style={{ color: THEME_TEXT_DARK }}
                      >
                        <Users className="inline-block mr-1" size={14} />{" "}
                        {group.memberCount}
                      </div>
                    </div>
                  </Link>
                  <CardContent className="p-6">
                    <Link href={`/groups/${group._id}`} className="block">
                      <h2
                        className="text-2xl font-bold mb-2 truncate"
                        style={{ color: THEME_TEXT_DARK }}
                      >
                        {group.name}
                      </h2>
                      <p
                        className="text-md line-clamp-2 mb-4"
                        style={{ color: THEME_TEXT_LIGHT }}
                      >
                        {group.description}
                      </p>
                    </Link>
                    <div className="flex justify-between items-center">
                      <span
                        className="font-bold px-4 py-1 rounded-full text-white text-sm"
                        style={{ backgroundColor: THEME_ACCENT_GREEN }}
                      >
                        Joined
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Groups You've Created Section */}
          <div className="border-t border-gray-200 pt-10 mt-10"></div>
          <h2
            className="text-3xl font-bold mb-8 text-center"
            style={{ color: THEME_TEXT_DARK }}
          >
            Communities You Lead
          </h2>
          {createdGroups.length === 0 ? (
            <p
              className="text-center py-12 text-xl bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 mb-12 animate-fade-in"
              style={{ color: THEME_TEXT_LIGHT }}
            >
              You haven't sculpted any communities yet. Take the lead and create
              one!
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {createdGroups.map((group) => (
                <Card
                  key={group._id}
                  className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100 group transform hover:scale-103 transition-transform duration-300 relative animate-fade-in-up"
                >
                  <Link href={`/groups/${group._id}`} className="block">
                    <div className="h-48 w-full bg-gray-100 relative overflow-hidden">
                      {group.coverImage ? (
                        <img
                          src={group.coverImage}
                          alt={group.name}
                          className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
                        />
                      ) : (
                        <div
                          className="w-full h-full flex items-center justify-center text-gray-600"
                          style={{ backgroundColor: THEME_PRIMARY_DARK_BLUE }}
                        >
                          <ImageIcon className="h-20 w-20 text-white opacity-70" />
                          <div className="absolute inset-0 bg-black opacity-10"></div>
                        </div>
                      )}
                      <div
                        className="absolute bottom-3 right-3 bg-white text-xs font-semibold px-3 py-1 rounded-full shadow-md flex items-center"
                        style={{ color: THEME_TEXT_DARK }}
                      >
                        <Users className="inline-block mr-1" size={14} />{" "}
                        {group.memberCount}
                      </div>
                    </div>
                  </Link>
                  <CardContent className="p-6">
                    <Link href={`/groups/${group._id}`} className="block">
                      <h2
                        className="text-2xl font-bold mb-2 truncate"
                        style={{ color: THEME_TEXT_DARK }}
                      >
                        {group.name}
                      </h2>
                      <p
                        className="text-md line-clamp-2 mb-4"
                        style={{ color: THEME_TEXT_LIGHT }}
                      >
                        {group.description}
                      </p>
                    </Link>
                    <div className="flex justify-between items-center">
                      <span
                        className="font-bold px-4 py-1 rounded-full text-white text-sm"
                        style={{ backgroundColor: THEME_PRIMARY_DARK_BLUE }}
                      >
                        Creator
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Discover More Groups Section */}
          <div className="border-t border-gray-200 pt-10 mt-10"></div>
          <h2
            className="text-3xl font-bold mb-8 text-center"
            style={{ color: THEME_TEXT_DARK }}
          >
            Discover More Groups
          </h2>
          {groups.length === 0 ? (
            <p
              className="text-center py-12 text-xl bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 mb-12 animate-fade-in"
              style={{ color: THEME_TEXT_LIGHT }}
            >
              No groups match your search. Unleash your creativity and create a
              new one!
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {groups.map((group) => (
                <Card
                  key={group._id}
                  className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100 group transform hover:scale-103 transition-transform duration-300 relative animate-fade-in-up"
                >
                  <Link href={`/groups/${group._id}`} className="block">
                    <div className="h-48 w-full bg-gray-100 relative overflow-hidden">
                      {group.coverImage ? (
                        <img
                          src={group.coverImage}
                          alt={group.name}
                          className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
                        />
                      ) : (
                        <div
                          className="w-full h-full flex items-center justify-center text-gray-600"
                          style={{ backgroundColor: THEME_PRIMARY_DARK_BLUE }}
                        >
                          <ImageIcon className="h-20 w-20 text-white opacity-70" />
                          <div className="absolute inset-0 bg-black opacity-10"></div>
                        </div>
                      )}
                      <div
                        className="absolute bottom-3 right-3 bg-white text-xs font-semibold px-3 py-1 rounded-full shadow-md flex items-center"
                        style={{ color: THEME_TEXT_DARK }}
                      >
                        <Users className="inline-block mr-1" size={14} />{" "}
                        {group.memberCount}
                      </div>
                    </div>
                  </Link>
                  <CardContent className="p-6">
                    <Link href={`/groups/${group._id}`} className="block">
                      <h2
                        className="text-2xl font-bold mb-2 truncate"
                        style={{ color: THEME_TEXT_DARK }}
                      >
                        {group.name}
                      </h2>
                      <p
                        className="text-md line-clamp-2 mb-4"
                        style={{ color: THEME_TEXT_LIGHT }}
                      >
                        {group.description}
                      </p>
                    </Link>
                    <div className="flex justify-between items-center">
                      {!group.isMember ? (
                        <Button
                          onClick={() =>
                            handleJoinGroup(group._id, group.privacy)
                          }
                          className="py-2 px-6 rounded-full font-bold text-sm shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 bg-yellow-500 hover:bg-yellow-600 text-white" // Tailwind colors for bg and hover
                        >
                          {group.privacy === "public" ? (
                            <>
                              <PlusCircle size={18} className="mr-2" /> Join
                              Group
                            </>
                          ) : (
                            <>
                              <PlusCircle size={18} className="mr-2" /> Request
                              to Join
                            </>
                          )}
                        </Button>
                      ) : (
                        <span
                          className="font-bold px-4 py-1 rounded-full text-white text-sm"
                          style={{ backgroundColor: THEME_ACCENT_GREEN }}
                        >
                          Joined
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          {totalPages > 1 && (
            <div className="mt-12 flex justify-center gap-6">
              <Button
                disabled={page === 1}
                onClick={() => {
                  setPage(page - 1);
                  fetchGroups(searchQuery, page - 1);
                }}
                className="py-3 px-8 rounded-full font-semibold transition-all duration-300 disabled:opacity-50 shadow-md hover:shadow-lg bg-blue-500 hover:bg-blue-600 text-white" // Tailwind colors for bg and hover
              >
                Previous Page
              </Button>
              <Button
                disabled={page >= totalPages}
                onClick={() => {
                  setPage(page + 1);
                  fetchGroups(searchQuery, page + 1);
                }}
                className="py-3 px-8 rounded-full font-semibold transition-all duration-300 disabled:opacity-50 shadow-md hover:shadow-lg bg-blue-500 hover:bg-blue-600 text-white" // Tailwind colors for bg and hover
              >
                Next Page
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GroupsPage;
