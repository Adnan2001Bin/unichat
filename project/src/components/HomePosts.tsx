"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { CldUploadWidget, CloudinaryUploadWidgetInfo, CloudinaryUploadWidgetResults } from "next-cloudinary";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { ImageIcon, Send, XCircle } from "lucide-react";
import Image from "next/image";
import { io, Socket } from "socket.io-client";
import Link from "next/link";
import Loader from "./Loader";

// Define the new color theme variables (copied from Home component for consistency)
const THEME_TEXT_DARK = '#2C3E50';
const THEME_TEXT_LIGHT = '#7F8C8D';

interface Post {
  _id: string;
  type: "personal" | "group";
  creator: {
    _id: string;
    userName: string;
    profilePicture?: string;
  };
  groupId?: string;
  groupName?: string;
  content: string;
  image?: string;
  createdAt: string;
}

const HomePosts: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
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
      socketRef.current?.emit("joinUser", { userId: session.user._id });
    });

    socketRef.current.on("post", (post: Post) => {
      setPosts((prev) => [post, ...prev]);
    });

    socketRef.current.on("groupPost", (post: Post) => {
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
        const response = await fetch("/api/post");
        const result = await response.json();
        if (result.success) {
          setPosts(result.data.reverse()); // Reverse to show newest first if API sends oldest first
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
  }, [status, session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !image) { // Allow image-only posts
      toast.error("Error", {
        description: "Post content or image cannot be empty",
        className: "bg-red-600 text-white border-red-700 backdrop-blur-md bg-opacity-80",
        duration: 4000,
      });
      return;
    }

    setLoading(true);

    try {
      socketRef.current?.emit("sendPost", { content, image });
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

  if (loading && posts.length === 0) { // Only show full loader if no posts are loaded yet
    return <Loader message="Loading posts..." />;
  }

  return (
    <div className="w-full">
      {/* Create New Post Section */}
      <Card className="mb-6 bg-white shadow-xl rounded-xl border border-gray-100">
        <CardContent className="p-6">
          <h2 className="text-xl font-bold mb-4" style={{ color: THEME_TEXT_DARK }}>Create a New Post</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind, student?"
              className="w-full p-4 rounded-lg border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all resize-none h-28 text-base"
              style={{ borderColor: THEME_TEXT_LIGHT, color: THEME_TEXT_DARK }}
            />
            {image && (
              <div className="relative mt-2">
                <Image
                  src={image}
                  alt="Post Preview"
                  width={600}
                  height={200}
                  className="w-full max-h-64 object-cover rounded-lg shadow-sm border border-gray-200"
                />
                <Button
                  type="button"
                  onClick={() => setImage(null)}
                  className="absolute top-2 right-2 p-1 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
                  size="icon"
                >
                  <XCircle className="h-5 w-5" />
                </Button>
              </div>
            )}
            <div className="flex items-center justify-between mt-4">
              <CldUploadWidget
                uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
                options={{
                  folder: "personal_posts",
                  sources: ["local", "url", "camera"],
                  multiple: false,
                  resourceType: "image",
                }}
                onSuccess={(result: CloudinaryUploadWidgetResults) => {
                  const info = result.info as CloudinaryUploadWidgetInfo | undefined;
                  const secureUrl = info?.secure_url;
                  if (secureUrl) {
                    setImage(secureUrl);
                    toast.success("Image uploaded successfully!", {
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
                    className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-5 rounded-full transition-all duration-300 shadow-sm hover:shadow-md"
                  >
                    <ImageIcon className="h-5 w-5 mr-2 text-green-500" />
                    Add Photo
                  </Button>
                )}
              </CldUploadWidget>
              <Button
                type="submit"
                disabled={loading || (!content.trim() && !image)}
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-full transition-all duration-300 transform hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed shadow-md hover:shadow-lg flex items-center"
              >
                <Send className="h-5 w-5 mr-2" />
                Post
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Display Posts */}
      <div className="space-y-5">
        {posts.length > 0 ? (
          posts.map((post) => (
            <Card key={post._id} className="bg-white shadow-lg rounded-xl border border-gray-100 hover:shadow-xl transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4 mb-3">
                  {post.creator.profilePicture ? (
                    <Image
                      src={post.creator.profilePicture}
                      alt={post.creator.userName}
                      width={48}
                      height={48}
                      className="rounded-full h-12 object-cover border-2 border-blue-200 shadow-sm"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg border-2 border-blue-200">
                      {post.creator.userName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-base" style={{ color: THEME_TEXT_DARK }}>
                      {post.creator.userName}
                      {post.type === "group" && post.groupId && post.groupName && (
                        <span className="text-sm font-normal ml-2" style={{ color: THEME_TEXT_LIGHT }}>
                          {" posted in "}
                          <Link href={`/groups/${post.groupId}`} className="text-blue-500 hover:underline font-medium">
                            {post.groupName}
                          </Link>
                        </span>
                      )}
                    </p>
                    <p className="text-xs mt-1" style={{ color: THEME_TEXT_LIGHT }}>
                      {new Date(post.createdAt).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </p>
                  </div>
                </div>
                <p className="text-base leading-relaxed mb-4" style={{ color: THEME_TEXT_DARK }}>{post.content}</p>
                {post.image && (
                  <Image
                    src={post.image}
                    alt="Post image"
                    width={400}
                    height={450}
                    className="mt-2 w-full h-auto object-cover rounded-lg shadow-md border border-gray-100"
                  />
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center p-8 bg-white rounded-xl shadow-md text-gray-500">
            <p className="text-lg" style={{ color: THEME_TEXT_LIGHT }}>No posts yet! Be the first to share something.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePosts;