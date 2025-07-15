"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import GroupPosts from "@/components/GroupPosts";
import Loader from "@/components/Loader";

const GroupPostsPage: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const groupId = params.id as string;

  console.log(session);
  
  if (status === "loading") {
    return <Loader message="Loading posts..." />;
  }

  if (status === "unauthenticated") {
    router.push("/sign-in");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4 sm:p-6 md:p-8 mt-16 font-sans">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Group Posts</h1>
        <GroupPosts groupId={groupId} />
      </div>
    </div>
  );
};

export default GroupPostsPage;