"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
  Brain,
  GraduationCap,
  Briefcase,
  Edit,
  Image as ImageIcon,
  UserCircle,
} from "lucide-react";
import Loader from "@/components/Loader";

interface ProfileData {
  userName: string;
  profilePicture?: string;
  coverPhoto?: string;
  university?: string;
  graduationYear?: number;
  skills?: string[];
  headline?: string;
}

const MyProfile = () => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

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
      } catch (error) {
        console.error("Error fetching profile data:", error);
        toast.error("Error", {
          description: "Failed to fetch profile data.",
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

  if (loading) {
    return <Loader message="Loading profile..." />;
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
        <Card className="p-8 text-center shadow-xl rounded-lg">
          <p className="text-red-600 text-lg font-semibold mb-4">
            Oops! Unable to load your profile.
          </p>
          <Button
            onClick={() => router.push("/update-profile")}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105"
          >
            Create Your Profile Now
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-20 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <div className="max-w-4xl mx-auto">
        {/* Cover Photo and Profile Picture */}
        <div className="relative bg-white shadow-xl rounded-b-lg">
          <div className="h-48 w-full bg-gray-200 rounded-t-lg overflow-hidden relative">
            {profile.coverPhoto ? (
              <img
                src={profile.coverPhoto}
                alt="Cover Photo"
                className="w-full h-full object-cover transition-transform duration-300 ease-in-out hover:scale-105"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-blue-300 to-purple-300 flex items-center justify-center text-gray-600">
                <ImageIcon className="h-12 w-12 text-white opacity-70" />
              </div>
            )}
            <div className="absolute top-4 right-4">
              <Button
                variant="outline"
                size="icon"
                className="rounded-full bg-white/70 backdrop-blur-sm hover:bg-white transition-colors duration-200"
                onClick={() =>
                  toast.info("Feature coming soon!", {
                    description:
                      "Edit cover photo functionality is under development.",
                  })
                }
              >
                <Edit className="h-5 w-5 text-gray-700" />
              </Button>
            </div>
          </div>
          <div className="absolute -bottom-16 left-8">
            <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-100 flex items-center justify-center transition-transform duration-300 ease-in-out hover:scale-105">
              {profile.profilePicture ? (
                <img
                  src={profile.profilePicture}
                  alt="Profile Picture"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500 text-2xl bg-blue-100">
                  <UserCircle className="h-20 w-20 text-blue-500" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Profile Details Card */}
        <Card className="mt-20 bg-white shadow-xl rounded-lg p-6 sm:p-8 transform transition-transform duration-300 ease-in-out hover:scale-[1.01]">
          <CardContent className="p-0">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
              <div>
                <h1 className="text-3xl font-extrabold text-gray-900 leading-tight">
                  {profile.userName}
                </h1>
                {profile.headline && (
                  <p className="text-gray-700 mt-2 text-lg font-medium">
                    {profile.headline}
                  </p>
                )}
              </div>
              <Button
                onClick={() => router.push("/update-profile")}
                className="mt-4 sm:mt-0 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-2 px-6 rounded-full shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-2xl flex items-center"
              >
                <Edit className="h-5 w-5 mr-2" />
                Edit Profile
              </Button>
            </div>

            {/* About Section */}
            {profile.headline && (
              <div className="mt-8 border-t border-gray-200 pt-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center mb-3">
                  <Briefcase className="h-6 w-6 mr-3 text-blue-500" /> About
                </h2>
                <p className="text-gray-600 leading-relaxed text-base">
                  {profile.headline}
                </p>
              </div>
            )}

            {/* Education Section */}
            {(profile.university || profile.graduationYear) && (
              <div className="mt-8 border-t border-gray-200 pt-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center mb-3">
                  <GraduationCap className="h-6 w-6 mr-3 text-purple-500" />{" "}
                  Education
                </h2>
                <div className="mt-2 space-y-1">
                  {profile.university && (
                    <p className="text-gray-700 font-semibold text-lg">
                      {profile.university}
                    </p>
                  )}
                  {profile.graduationYear && (
                    <p className="text-gray-500 text-base">
                      Class of {profile.graduationYear}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Skills Section */}
            {profile.skills && profile.skills.length > 0 && (
              <div className="mt-8 border-t border-gray-200 pt-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center mb-3">
                  <Brain className="h-6 w-6 mr-3 text-green-500" /> Skills
                </h2>
                <div className="flex flex-wrap gap-3 mt-2">
                  {profile.skills.map((skill) => (
                    <span
                      key={skill}
                      className="bg-blue-50 text-blue-800 text-sm font-medium px-4 py-2 rounded-full shadow-sm hover:bg-blue-100 transition-colors duration-200 cursor-pointer"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MyProfile;
