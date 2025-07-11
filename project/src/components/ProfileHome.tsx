import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { ImageIcon, UserCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import Loader from "./Loader";
import Friends from "./Friends";

interface ProfileData {
  userName: string;
  profilePicture?: string;
  coverPhoto?: string;
  university?: string;
  graduationYear?: number;
  skills?: string[];
  headline?: string;
}

function ProfileHome() {
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
    <div className="w-[90%] h-[100%] bg-gradient-to-br from-blue-50 to-purple-50 animate-fade-in">
      <div className="">
        <div className="relative bg-white shadow-xl rounded-b-lg">
          <div className="h-25 w-full bg-gray-200 rounded-t-lg overflow-hidden relative">
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
          </div>
          <div className="absolute -bottom-16 left-8">
            <div className="w-25 h-25 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-100 flex items-center justify-center transition-transform duration-300 ease-in-out hover:scale-105">
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
        <Card className="mt-10 bg-white shadow-xl rounded-lg p-8">
          <CardContent className="p-0">
            <div className="flex flex-row justify-between items-center">
              <div>
                <h1 className="text-lg font-bold text-gray-900 leading-tight">
                  {profile.userName}
                </h1>
                {profile.headline && (
                  <p className="text-gray-700 mt-2 text-xs font-medium">
                    {profile.headline}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-2 bg-white shadow-xl rounded-lg p-3">
          <CardContent className="p-0">
            <div className="flex flex-row justify-between items-center">
              <Friends />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default ProfileHome;
