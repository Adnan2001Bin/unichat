'use client';

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, UserPlus, UserCheck, UserX } from "lucide-react";
import Loader from "@/components/Loader";

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
    <div className="min-h-screen bg-gradient-to-br from-emerald-100 to-teal-50 p-4 sm:p-6 lg:p-8 mt-15">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-white shadow-xl rounded-2xl overflow-hidden border border-emerald-100">
          <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white p-6">
            <CardTitle className="text-3xl font-bold tracking-tight">
              Friends Hub
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button
                onClick={() => router.push("/friends/list")}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <Users className="w-6 h-6" />
                <span>Your Friends</span>
              </Button>
              <Button
                onClick={() => router.push("/friends/findfriends")}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <UserPlus className="w-6 h-6" />
                <span>Add Friends</span>
              </Button>
              <Button
                onClick={() => router.push("/friends/pending-received")}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <UserCheck className="w-6 h-6" />
                <span>Pending Requests</span>
              </Button>
              <Button
                onClick={() => router.push("/friends/pending-sent")}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-center space-x-2"
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