"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import {
  ImageIcon,
  UserCircle,
  Users,
  GraduationCap,
  Building2,
  ExternalLink,
} from "lucide-react"; // Added GraduationCap, Building2, ExternalLink
import { useRouter } from "next/navigation";
import Loader from "./Loader";
import Friends from "./Friends"; // Assuming this is a component that might display friend count or a list summary
import { useSession } from "next-auth/react";
import Link from "next/link";

// Define the new color theme variables (copied for consistency)
const THEME_PRIMARY_DARK_BLUE = "#2C3E50";
const THEME_SECONDARY_BLUE = "#3498DB";
const THEME_ACCENT_GREEN = "#2ECC71";
const THEME_BACKGROUND_LIGHT = "#ECF0F1";
const THEME_TEXT_DARK = "#2C3E50";
const THEME_TEXT_LIGHT = "#7F8C8D";

interface ProfileData {
  userName: string;
  profilePicture?: string;
  coverPhoto?: string;
  university?: string;
  graduationYear?: number;
  skills?: string[];
  headline?: string;
}
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

function ProfileHome() {
  const { status, data: session } = useSession();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState<Group[]>([]);

  const router = useRouter();
  console.log(session);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await fetch("/api/get-updated-field", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        const result = await response.json();
        if (result.success && result.data) {
          setProfile(result.data);
        } else {
          toast.error("Error", {
            description: result.message || "Failed to fetch profile data.",
            className:
              "bg-red-600 text-white border-red-700 backdrop-blur-md bg-opacity-80",
            duration: 4000,
          });
        }
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to fetch profile data";
        console.error("Error fetching profile data:", errorMessage);
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

    fetchProfileData();
  }, []);

  const fetchGroups = async (query: string = "", page: number = 1) => {
    try {
      const response = await fetch(
        `/api/groups?query=${encodeURIComponent(query)}&page=${page}&limit=10`
      );
      const result = await response.json();
      if (result.success) {
        setGroups(result.data);
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
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchGroups();
    }
  }, [status]);

  const joinedGroups = groups.filter((group) => group.isMember);

  if (loading) {
    // This `loading` state combines profile and group loading
    return <Loader message="Loading profile and groups..." />;
  }

  if (!profile) {
    return (
      <div
        className="min-h-screen flex items-center justify-center relative z-10"
        style={{ backgroundColor: THEME_BACKGROUND_LIGHT }}
      >
        <Card
          className="p-8 text-center shadow-xl rounded-xl"
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            backdropFilter: "blur(10px)",
          }}
        >
          <p
            className="text-lg font-semibold mb-4"
            style={{ color: THEME_TEXT_DARK }}
          >
            Oops! Unable to load your profile.
          </p>
          <Button
            onClick={() => router.push("/update-profile")}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-full transition-all duration-300 transform hover:scale-105"
          >
            Create Your Profile Now
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full">
      {" "}
      {/* Full width within its column */}
      {/* Profile Header Card */}
      <Card className="bg-white shadow-xl rounded-xl overflow-hidden mb-6 border border-gray-100 transition-all duration-200 hover:shadow-2xl">
        {/* Clickable area for profile summary */}
        <Link href={"/profile"} className="block">
          <div className="relative h-32 w-full rounded-t-xl overflow-hidden">
            {" "}
            {/* Reduced height for cover photo */}
            {profile.coverPhoto ? (
              <Image
                src={profile.coverPhoto}
                alt="Cover Photo"
                layout="fill"
                objectFit="cover"
                className="transition-transform duration-300 ease-in-out group-hover:scale-105" // Added group-hover
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center"
                style={{
                  background: `linear-gradient(to right, ${THEME_SECONDARY_BLUE}, ${THEME_ACCENT_GREEN})`,
                }}
              >
                <ImageIcon className="h-16 w-16 text-white opacity-70" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>{" "}
            {/* Subtle overlay */}
          </div>
          <div className="relative p-6 pt-0">
            <div className="absolute -top-12 left-6">
              {" "}
              {/* Adjusted position */}
              <div
                className="w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-100 flex items-center justify-center transition-transform duration-300 ease-in-out group-hover:scale-105" // Added group-hover
                style={{ borderColor: THEME_BACKGROUND_LIGHT }}
              >
                {" "}
                {/* White border from theme */}
                {profile.profilePicture ? (
                  <Image
                    src={profile.profilePicture}
                    alt="Profile Picture"
                    layout="fill"
                    objectFit="cover"
                    className="rounded-full"
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center text-gray-500 text-2xl"
                    style={{
                      backgroundColor: THEME_PRIMARY_DARK_BLUE,
                      color: "white",
                    }}
                  >
                    <UserCircle className="h-16 w-16" />
                  </div>
                )}
              </div>
            </div>
            <div className="pt-14 pb-2">
              {" "}
              {/* Padding to accommodate avatar */}
              <h1
                className="text-xl font-bold leading-tight"
                style={{ color: THEME_TEXT_DARK }}
              >
                {profile.userName}
              </h1>
              {profile.headline && (
                <p
                  className="mt-1 text-sm font-medium"
                  style={{ color: THEME_TEXT_LIGHT }}
                >
                  {profile.headline}
                </p>
              )}
              {profile.university && (
                <p
                  className="mt-1 text-sm flex items-center gap-1"
                  style={{ color: THEME_TEXT_LIGHT }}
                >
                  <Building2 className="w-4 h-4" /> {profile.university}
                  {profile.graduationYear && (
                    <span className="ml-1 flex items-center">
                      <GraduationCap className="w-4 h-4 mr-1" /> Class of{" "}
                      {String(profile.graduationYear).slice(2)}{" "}
                      {/* Fixed year format */}
                    </span>
                  )}
                </p>
              )}
            </div>
          </div>
        </Link>
      </Card>
      {/* Friends Card - Direct link to friends page */}
      <Link href={"/friends"} className="block">
        <Card className="bg-white shadow-xl rounded-xl p-4 mb-4 border border-gray-100 transition-all duration-200 hover:shadow-2xl hover:bg-gray-50">
          <CardContent className="p-0 flex items-center justify-between">
            <h2
              className="text-lg font-bold flex items-center gap-2"
              style={{ color: THEME_TEXT_DARK }}
            >
              <Users
                className="w-5 h-5"
                style={{ color: THEME_SECONDARY_BLUE }}
              />{" "}
              Friends
            </h2>
            <div className="flex items-center space-x-2">
              {/* Assuming Friends component just returns text/number or similar, if it has its own Card, simplify it. */}
              {/* If 'Friends' component provides the count, it's fine. Otherwise, replace with actual count. */}
              <span
                className="text-lg font-bold"
                style={{ color: THEME_TEXT_DARK }}
              >
                {/* Replace with actual friends count if available in profile data, e.g., profile.friendsCount */}
                <Friends />{" "}
                {/* This component probably needs to be simplified to just return a number or text */}
              </span>
              <Button
                size="sm"
                className="bg-blue-500 hover:bg-blue-600 text-white rounded-full text-xs"
              >
                View All <ExternalLink className="w-3 h-3 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </Link>
      {/* Groups Card - Direct link to groups page */}
      <Link href={"/groups"} className="block">
        <Card className="bg-white shadow-xl rounded-xl p-4 border border-gray-100 transition-all duration-200 hover:shadow-2xl hover:bg-gray-50">
          <CardContent className="p-0 flex items-center justify-between">
            <h2
              className="text-lg font-bold flex items-center gap-2"
              style={{ color: THEME_TEXT_DARK }}
            >
              <Building2
                className="w-5 h-5"
                style={{ color: THEME_ACCENT_GREEN }}
              />{" "}
              Groups
            </h2>
            <div className="flex items-center space-x-2">
              <p
                className="text-lg font-bold"
                style={{ color: THEME_TEXT_DARK }}
              >
                {joinedGroups.length}
              </p>
              <Button
                size="sm"
                className="bg-blue-500 hover:bg-blue-600 text-white rounded-full text-xs"
              >
                View All <ExternalLink className="w-3 h-3 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}

export default ProfileHome;
