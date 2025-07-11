'use client';

import React, { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Users } from "lucide-react"; // Removed Loader2 as it's not directly used for the button's icon
import { io, Socket } from "socket.io-client";
import Loader from "@/components/Loader";

// Define the new color theme variables based on "Professional & Calming"
const THEME_PRIMARY_DARK_BLUE = '#2C3E50'; // For strong elements, main text, header gradient start, and one blob
const THEME_SECONDARY_BLUE = '#3498DB'; // For main action buttons, header gradient end, and one blob
const THEME_ACCENT_GREEN = '#2ECC71'; // For success states, and one blob
const THEME_BACKGROUND_LIGHT = '#ECF0F1'; // Page background
const THEME_TEXT_DARK = '#2C3E50'; // Main dark text
const THEME_TEXT_LIGHT = '#7F8C8D'; // Secondary light text
const THEME_CTA_YELLOW = '#F1C40F'; // For one blob (can be used for a specific CTA if needed)

// No specific hover variables needed when using direct Tailwind classes like hover:bg-blue-600

interface GroupMessage {
  senderId: string;
  senderName: string;
  content: string;
  createdAt: string;
}

const GroupChat: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const groupId = params.id as string;
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Effect for authentication, fetching messages, and socket setup
  useEffect(() => {
    if (status === "loading") {
      // Still loading session, do nothing yet
      return;
    }

    if (status === "unauthenticated") {
      router.push("/sign-in");
      return;
    }

    if (!groupId || groupId === "undefined") {
      toast.error("Error", {
        description: "Invalid group ID",
        className: "bg-red-600 text-white border-red-700 backdrop-blur-md bg-opacity-80",
        duration: 4000,
      });
      router.push("/groups");
      return;
    }

    const fetchMessages = async () => {
      try {
        const response = await fetch(`/api/groups/messages?groupId=${groupId}`);
        const result = await response.json();
        if (result.success) {
          setMessages(result.data);
        } else {
          toast.error("Error", {
            description: result.message || "Failed to fetch group messages",
            className: "bg-red-600 text-white border-red-700 backdrop-blur-md bg-opacity-80",
            duration: 4000,
          });
        }
      } catch (error) {
        toast.error("Error", {
          description: "Failed to fetch group messages",
          className: "bg-red-600 text-white border-red-700 backdrop-blur-md bg-opacity-80",
          duration: 4000,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

    // Initialize socket connection
    const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000", {
      auth: { userId: session?.user?._id },
    });

    socketInstance.on("connect", () => {
      socketInstance.emit("joinGroup", { groupId });
    });

    socketInstance.on("joinedGroup", ({ groupId: joinedGroupId }) => {
      console.log(`Joined group: ${joinedGroupId}`);
    });

    socketInstance.on("groupMessage", (message: GroupMessage) => {
      setMessages((prev) => [...prev, message]);
    });

    socketInstance.on("error", ({ message }) => {
      toast.error("Error", {
        description: message,
        className: "bg-red-600 text-white border-red-700 backdrop-blur-md bg-opacity-80",
        duration: 4000,
      });
    });

    setSocket(socketInstance);

    // Cleanup function for socket
    return () => {
      socketInstance.disconnect();
    };
  }, [status, session, groupId, router]); // Re-run if these dependencies change

  // Effect to scroll to the bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Function to handle sending messages
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !socket) return;

    try {
      socket.emit("sendGroupMessage", { groupId, content: newMessage });
      setNewMessage("");
    } catch (error) {
      toast.error("Error", {
        description: "Failed to send message",
        className: "bg-red-600 text-white border-red-700 backdrop-blur-md bg-opacity-80",
        duration: 4000,
      });
    }
  };

  // Display loader while content is loading
  if (loading) {
    return <Loader message="Loading group chat..." />;
  }

  return (
    // Main container for the chat page, with theme background and centering
    <div 
      className="min-h-screen mt-5 pt-16 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans relative overflow-hidden" 
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

      {/* Chat Card - Responsive width and elevated shadow */}
      <Card className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl xl:max-w-3xl bg-white shadow-2xl rounded-xl flex flex-col h-[85vh] overflow-hidden relative z-10">
        {/* Card Header for Group Name */}
        <CardHeader className="p-4 sm:p-5 rounded-t-xl shadow-md" style={{ background: `linear-gradient(to right, ${THEME_PRIMARY_DARK_BLUE}, ${THEME_SECONDARY_BLUE})`, color: 'white' }}>
          <CardTitle className="text-xl sm:text-2xl font-bold flex items-center gap-3">
            <Users className="h-6 w-6 sm:h-7 sm:w-7" />
            Group Chat
            {/* You might want to display the actual group name here once fetched */}
            {/* For example: {groupNameState || "Loading Group Name..."} */}
          </CardTitle>
        </CardHeader>

        {/* Messages Display Area - Scrollable with custom scrollbar and themed background */}
        <CardContent className="flex-1 p-4 sm:p-6 overflow-y-auto custom-scrollbar" style={{ backgroundColor: `${THEME_BACKGROUND_LIGHT}D0` }}>
          {messages.length === 0 ? (
            // Message for empty chat, centered and styled with theme colors
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
              <Users className="h-12 w-12 mb-4" style={{ color: THEME_SECONDARY_BLUE, opacity: 0.6 }} />
              <p className="text-lg font-medium" style={{ color: THEME_TEXT_DARK }}>No messages yet!</p>
              <p className="text-sm mt-1" style={{ color: THEME_TEXT_LIGHT }}>Be the first to start the conversation.</p>
            </div>
          ) : (
            // Map through messages and display them
            messages.map((msg, index) => (
              <div
                key={index}
                className={`mb-4 flex ${
                  msg.senderId === session?.user?._id ? "justify-end" : "justify-start"
                }`}
              >
                {/* Message Bubble - Dynamic styling based on sender with theme colors */}
                <div
                  className={`max-w-[80%] sm:max-w-[70%] p-3 sm:p-4 rounded-xl shadow-md transition-all duration-200 ease-in-out ${
                    msg.senderId === session?.user?._id
                      ? "bg-blue-500 text-white rounded-br-none" // User's messages (Tailwind blue)
                      : "bg-gray-200 text-gray-800 rounded-bl-none" // Other's messages (Tailwind gray)
                  }`}
                  style={{
                    backgroundColor: msg.senderId === session?.user?._id ? THEME_SECONDARY_BLUE : '#F0F0F0', // User message: theme blue, Others: light gray
                    color: msg.senderId === session?.user?._id ? 'white' : THEME_TEXT_DARK,
                  }}
                >
                  {/* Sender Name */}
                  <p className="text-xs sm:text-sm font-semibold mb-1 opacity-90" style={{ color: msg.senderId === session?.user?._id ? 'rgba(255,255,255,0.8)' : THEME_TEXT_LIGHT }}>
                    {msg.senderId === session?.user?._id ? "You" : msg.senderName}
                  </p>
                  {/* Message Content */}
                  <p className="text-sm sm:text-base break-words">{msg.content}</p>
                  {/* Timestamp */}
                  <p className="text-right text-xs mt-2 opacity-70" style={{ color: msg.senderId === session?.user?._id ? 'rgba(255,255,255,0.6)' : THEME_TEXT_LIGHT }}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))
          )}
          {/* Ref for auto-scrolling to the latest message */}
          <div ref={messagesEndRef} />
        </CardContent>

        {/* Message Input Area - Sticky at the bottom */}
        <div className="p-4 sm:p-6 border-t border-gray-200 bg-white flex items-center gap-3">
          {/* Input Field */}
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message here..."
            className="flex-1 p-3 sm:p-4 rounded-full border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200 text-base"
            style={{ borderColor: THEME_TEXT_LIGHT, color: THEME_TEXT_DARK, '--tw-focus-ring-color': `${THEME_SECONDARY_BLUE}33` } as React.CSSProperties}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
          />
          {/* Send Button */}
          <Button
            onClick={handleSendMessage}
            className="p-3 sm:p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 bg-blue-500 hover:bg-blue-600 text-white" // Tailwind colors for bg and hover
            disabled={!newMessage.trim()} // Disable if message is empty
          >
            <Send className="h-5 w-5 sm:h-6 sm:w-6" />
          </Button>
        </div>
      </Card>

      {/* Custom Scrollbar Styles (can be moved to a global CSS file if preferred) */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: ${THEME_BACKGROUND_LIGHT}; /* Use theme color for track */
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: ${THEME_TEXT_LIGHT}; /* Use theme color for thumb */
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: ${THEME_TEXT_DARK}; /* Darker theme color on hover */
        }
      `}</style>
    </div>
  );
};

export default GroupChat;