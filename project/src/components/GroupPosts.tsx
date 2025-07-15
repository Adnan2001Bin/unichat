"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { CldUploadWidget, CloudinaryUploadWidgetInfo, CloudinaryUploadWidgetResults } from "next-cloudinary";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ImageIcon, Send } from "lucide-react";
import Image from "next/image";
import { io, Socket } from "socket.io-client";

interface GroupPost {
  _id: string;
  groupId: string;
  creator: {
    _id: string;
    userName: string;
    profilePicture?: string;
  };
  content: string;
  image?: string;
  createdAt: string;
}

interface GroupPostsProps {
  groupId: string;
}

const GroupPosts: React.FC<GroupPostsProps> = ({ groupId }) => {
  const [posts, setPosts] = useState<GroupPost[]>([]);
  const [content, setContent] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { data: session, status } = useSession();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (status !== "authenticated" || !session?.user?._id) return;

    // Initialize Socket.IO
    socketRef.current = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000", {
      auth: { userId: session.user._id },
    });

    socketRef.current.on("connect", () => {
      socketRef.current?.emit("joinGroup", { groupId });
    });

    socketRef.current.on("groupPost", (post: GroupPost) => {
      setPosts((prev) => [post, ...prev]);
    });

    socketRef.current.on("error", ({ message }) => {
      toast.error("Error", {
        description: message,
        className: "bg-red-600 text-white border-red-700 backdrop-blur-md bg-opacity-80",
        duration: 4000,
      });
    });

    // Fetch initial posts
    const fetchPosts = async () => {
      try {
        const response = await fetch(`/api/groups/group-post?groupId=${groupId}`);
        const result = await response.json();
        if (result.success) {
          setPosts(result.data);
        } else {
          toast.error("Error", {
            description: result.message || "Failed to fetch posts",
            className: "bg-red-600 text-white border-red-700 backdrop-blur-md bg-opacity-80",
            duration: 4000,
          });
        }
      } catch (error) {
        console.error("Error fetching posts:", error);
        toast.error("Error", {
          description: "Failed to fetch posts",
          className: "bg-red-600 text-white border-red-700 backdrop-blur-md bg-opacity-80",
          duration: 4000,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();

    return () => {
      socketRef.current?.disconnect();
    };
  }, [status, session, groupId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      toast.error("Error", {
        description: "Post content cannot be empty",
        className: "bg-red-600 text-white border-red-700 backdrop-blur-md bg-opacity-80",
        duration: 4000,
      });
      return;
    }

    setLoading(true);

    try {
      socketRef.current?.emit("sendGroupPost", {
        groupId,
        content,
        image,
      });
      setContent("");
      setImage(null);
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error("Error", {
        description: "Failed to create post",
        className: "bg-red-600 text-white border-red-700 backdrop-blur-md bg-opacity-80",
        duration: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <Card className="mb-4 bg-white shadow-md rounded-lg">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind?"
              className="w-full p-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-300 transition-all resize-none h-24"
              rows={4}
            />
            <div className="flex items-center space-x-4">
              <CldUploadWidget
                uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
                options={{
                  folder: "group_posts",
                  sources: ["local", "url", "camera"],
                  multiple: false,
                  resourceType: "image",
                }}
                onSuccess={(result: CloudinaryUploadWidgetResults) => {
                  const info = result.info as CloudinaryUploadWidgetInfo | undefined;
                  const secureUrl = info?.secure_url;
                  if (secureUrl) {
                    setImage(secureUrl);
                    toast.success("Image uploaded successfully", {
                      className:
                        "bg-green-600 text-white border-green-700 backdrop-blur-md bg-opacity-80",
                      duration: 4000,
                    });
                  }
                }}
              >
                {({ open }) => (
                  <Button
                    type="button"
                    onClick={() => open()}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-full transition-all duration-300"
                  >
                    <ImageIcon className="h-5 w-5 mr-2" />
                    Upload Image
                  </Button>
                )}
              </CldUploadWidget>
              <Button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-[#5095d1] to-[#2e619f] hover:from-[#5095d1] hover:to-[#497ec0] text-white font-semibold py-2 px-4 rounded-full transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
              >
                <Send className="h-5 w-5 mr-2" />
                Post
              </Button>
            </div>
            {image && (
              <Image
                src={image}
                alt="Post Preview"
                width={400}
                height={128}
                className="mt-2 w-full h-32 object-cover rounded-lg shadow-sm"
              />
            )}
          </form>
        </CardContent>
      </Card>
      <div className="space-y-4">
        {posts.map((post) => (
          <Card key={post._id} className="bg-white shadow-md rounded-lg">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4 mb-2">
                {post.creator.profilePicture ? (
                  <Image
                    src={post.creator.profilePicture}
                    alt={post.creator.userName}
                    width={40}
                    height={40}
                    className="rounded-full object-cover border border-gray-300"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    {post.creator.userName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="font-semibold text-gray-800">{post.creator.userName}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(post.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              <p className="text-gray-700">{post.content}</p>
              {post.image && (
                <Image
                  src={post.image}
                  alt="Post image"
                  width={400}
                  height={300}
                  className="mt-2 w-full h-auto object-cover rounded-lg shadow-sm"
                />
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default GroupPosts;