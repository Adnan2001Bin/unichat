"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ImageIcon, Users, UserCircle } from "lucide-react";
import Loader from "@/components/Loader";
import Link from "next/link";

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

interface Member {
  _id: string;
  userName: string;
  profilePicture?: string;
}

const GroupDetails: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const groupId = params.id as string;
  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMembers = async () => {
    try {
      const response = await fetch(`/api/groups/${groupId}/members`);
      const result = await response.json();
      if (result.success) {
        setMembers(result.data);
      } else {
        toast.error("Error", {
          description: result.message || "Failed to fetch group members",
          className:
            "bg-red-600 text-white border-red-700 backdrop-blur-md bg-opacity-80",
          duration: 4000,
        });
      }
    } catch (error) {
      console.error(error);
      toast.error("Error", {
        description: "Failed to fetch group members",
        className:
          "bg-red-600 text-white border-red-700 backdrop-blur-md bg-opacity-80",
        duration: 4000,
      });
    }
  };

  const fetchGroupDetails = async () => {
    try {
      const response = await fetch(`/api/groups/${groupId}`);
      const result = await response.json();
      if (result.success) {
        setGroup(result.data);
        if (result.data.isMember) {
          fetchMembers();
        }
      } else {
        toast.error("Error", {
          description: result.message || "Failed to fetch group details",
          className:
            "bg-red-600 text-white border-red-700 backdrop-blur-md bg-opacity-80",
          duration: 4000,
        });
      }
    } catch (error) {
      console.error(error);
      toast.error("Error", {
        description: "Failed to fetch group details",
        className:
          "bg-red-600 text-white border-red-700 backdrop-blur-md bg-opacity-80",
        duration: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/sign-in");
      return;
    }

    if (status === "authenticated" && groupId) {
      fetchGroupDetails();
    }
  }, [status, groupId, router]);

  const handleJoinGroup = async () => {
    if (!group) return;
    try {
      const response = await fetch("/api/groups/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupId,
          action: group.privacy === "public" ? "join" : "request",
        }),
      });
      const result = await response.json();
      if (result.success) {
        toast.success("Success", {
          description: result.message,
          className:
            "bg-green-600 text-white border-green-700 backdrop-blur-md bg-opacity-80",
          duration: 4000,
        });
        setGroup((prev) => (prev ? { ...prev, isMember: true } : prev));
        if (group.privacy === "public") {
          fetchMembers();
        }
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
        description: "Failed to join group",
        className:
          "bg-red-600 text-white border-red-700 backdrop-blur-md bg-opacity-80",
        duration: 4000,
      });
    }
  };

  if (status === "loading" || loading) {
    return <Loader message="Loading group details..." />;
  }

  if (!group) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
        <Card className="p-8 text-center shadow-xl rounded-lg">
          <p className="text-red-600 text-lg font-semibold mb-4">
            Group not found
          </p>
          <Button
            onClick={() => router.push("/groups")}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105"
          >
            Back to Groups
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4 sm:p-6 md:p-8 mt-16 font-sans">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-white shadow-xl rounded-xl">
          <div className="relative h-64 w-full bg-gray-200 rounded-t-xl overflow-hidden">
            {group.coverImage ? (
              <img
                src={group.coverImage}
                alt={group.name}
                className="w-full h-full object-cover transition-transform duration-300 ease-in-out hover:scale-105"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-blue-300 to-purple-300 flex items-center justify-center text-gray-600">
                <ImageIcon className="h-16 w-16 text-white opacity-70" />
              </div>
            )}
          </div>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  {group.name}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  {group.privacy.charAt(0).toUpperCase() +
                    group.privacy.slice(1)}{" "}
                  • Created by {group.creator.userName}
                </p>
                <p className="text-sm text-gray-500 flex items-center mt-1">
                  <Users className="w-4 h-4 mr-1" /> {group.memberCount} members
                </p>
              </div>
              <div className="mt-4 sm:mt-0 flex gap-2">
                {!group.isMember && (
                  <Button
                    onClick={handleJoinGroup}
                    className="bg-gradient-to-r from-[#5095d1] to-[#2e619f] hover:from-[#5095d1] hover:to-[#497ec0] text-white font-semibold py-2 px-4 rounded-full transition-all duration-300 transform hover:scale-105"
                  >
                    {group.privacy === "public"
                      ? "Join Group"
                      : "Request to Join"}
                  </Button>
                )}
                {group.isMember && (
                  <Link href={`/groups/${groupId}/chat`}>
                    <Button className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-full transition-all duration-300 transform hover:scale-105">
                      Group Chat
                    </Button>
                  </Link>
                )}
              </div>
            </div>
            <div className="border-t border-gray-100 pt-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                About
              </h2>
              <p className="text-gray-600">{group.description}</p>
            </div>
            <Card className="mt-6 bg-white shadow-md rounded-lg p-6">
              <CardContent className="p-0">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Creator
                </h2>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <UserCircle className="h-8 w-8 text-blue-500" />
                  </div>
                  <p className="text-gray-700 font-medium">
                    {group.creator.userName}
                  </p>
                </div>
              </CardContent>
            </Card>
            {group.isMember && (
              <Card className="mt-6 bg-white shadow-md rounded-lg p-6">
                <CardContent className="p-0">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">
                    Members
                  </h2>
                  {members.length === 0 ? (
                    <p className="text-gray-500">No members found.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {members.map((member) => (
                        <div
                          key={member._id}
                          className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-all duration-300"
                        >
                          {member.profilePicture ? (
                            <img
                              src={member.profilePicture}
                              alt={`${member.userName}'s profile`}
                              className="w-12 h-12 rounded-full object-cover border border-gray-300"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                              <UserCircle className="h-8 w-8 text-blue-500" />
                            </div>
                          )}
                          <p className="text-gray-700 font-medium">
                            {member.userName}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GroupDetails;
