'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Send,
  UserPlus,
  ChevronLeft,
  MessageSquare,
  Search,
  MoreVertical,
  Smile,
  Paperclip,
} from 'lucide-react';
import Loader from '@/components/Loader';
import Image from 'next/image';
import img1 from "../../../../public/images/chat/person.png";

// Define the new color theme variables based on "Professional & Calming"
const THEME_PRIMARY_DARK_BLUE = '#2C3E50'; // For strong elements, main text, "Creator" tag, and one blob
const THEME_SECONDARY_BLUE = '#3498DB'; // For main action buttons like Send, Search, and one blob
const THEME_ACCENT_GREEN = '#2ECC71'; // For "Joined" tag, approve buttons, and one blob
const THEME_BACKGROUND_LIGHT = '#ECF0F1'; // Page background
const THEME_TEXT_DARK = '#2C3E50'; // Main dark text (matches primary dark blue for consistency)
const THEME_TEXT_LIGHT = '#7F8C8D'; // Secondary light text for descriptions, etc.
const THEME_CTA_YELLOW = '#F1C40F'; // For "Add Friend" button, or other calls to action, and one blob

// No specific hover variables needed when using direct Tailwind classes like hover:bg-blue-600

interface Message {
  senderId: string;
  recipientId: string;
  content: string;
  createdAt: string;
}

interface User {
  _id: string;
  userName: string;
  profilePicture?: string;
}

const Chat: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [friends, setFriends] = useState<User[]>([]);
  const [filteredFriends, setFilteredFriends] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Detect mobile size for responsive layout
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch friends list
  useEffect(() => {
    if (status === 'authenticated') {
      const fetchFriends = async () => {
        try {
          setLoading(true);
          const response = await fetch('/api/list_friends_and_pending_requests');
          const result = await response.json();
          if (result.success) {
            setFriends(result.data.connections);
            setFilteredFriends(result.data.connections);
          } else {
            toast.error(result.message || 'Failed to fetch friends', {
              className: 'bg-red-600 text-white border-red-700 backdrop-blur-md bg-opacity-80',
              duration: 4000,
            });
          }
        } catch (error) {
          console.error(error);
          toast.error('Error fetching friends', {
            className: 'bg-red-600 text-white border-red-700 backdrop-blur-md bg-opacity-80',
            duration: 4000,
          });
        } finally {
          setLoading(false);
        }
      };
      fetchFriends();
    }
  }, [status]);

  // Search for users when query changes
  useEffect(() => {
    if (status === 'authenticated' && searchQuery.trim()) {
      const searchUsers = async () => {
        try {
          const response = await fetch(`/api/search?query=${encodeURIComponent(searchQuery)}`);
          const result = await response.json();
          if (result.success) {
            // Filter out current user and existing friends
            const nonFriends = result.data.filter(
              (user: User) =>
                user._id !== session?.user._id &&
                !friends.some((friend) => friend._id === user._id)
            );
            setSearchResults(nonFriends);
            // Filter friends list based on query
            setFilteredFriends(
              friends.filter((friend) =>
                friend.userName.toLowerCase().includes(searchQuery.toLowerCase())
              )
            );
          } else {
            toast.error(result.message || 'Failed to search users', {
              className: 'bg-red-600 text-white border-red-700 backdrop-blur-md bg-opacity-80',
              duration: 4000,
            });
          }
        } catch (error) {
          console.error(error);
          toast.error('Error searching users', {
            className: 'bg-red-600 text-white border-red-700 backdrop-blur-md bg-opacity-80',
            duration: 4000,
          });
        }
      };
      searchUsers();
    } else {
      setSearchResults([]);
      setFilteredFriends(friends);
    }
  }, [searchQuery, status, friends, session?.user._id]);

  // Initialize Socket.IO connection
  useEffect(() => {
    if (status === 'authenticated' && session?.user?._id) {
      const socketInstance = io(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:4000', {
        auth: { userId: session.user._id },
      });

      socketInstance.on('connect', () => {
        console.log('Connected to Socket.IO server');
      });

      socketInstance.on('message', (message: Message) => {
        if (
          selectedFriend &&
          ((message.senderId === selectedFriend._id && message.recipientId === session.user._id) ||
            (message.senderId === session.user._id && message.recipientId === selectedFriend._id))
        ) {
          setMessages((prev) => [...prev, message]);
        }
      });

      socketInstance.on('error', ({ message, action, recipientId }) => {
        if (action === 'sendFriendRequest') {
          toast.error(message, {
            className: 'bg-red-600 text-white border-red-700 backdrop-blur-md bg-opacity-80',
            duration: 4000,
            action: {
              label: 'Send Friend Request',
              onClick: () => sendFriendRequest(recipientId),
            },
          });
        } else {
          toast.error(message, {
            className: 'bg-red-600 text-white border-red-700 backdrop-blur-md bg-opacity-80',
            duration: 4000,
          });
        }
      });

      setSocket(socketInstance);

      return () => {
        socketInstance.disconnect();
      };
    }
  }, [status, session, selectedFriend]);

  // Fetch chat history when a friend is selected
  useEffect(() => {
    if (status === 'authenticated' && selectedFriend) {
      const fetchChatHistory = async () => {
        try {
          setLoading(true);
          const response = await fetch(`/api/messages/history?recipientId=${selectedFriend._id}`);
          const result = await response.json();
          if (result.success) {
            setMessages(result.data);
          } else {
            toast.error(result.message || 'Failed to fetch chat history', {
              className: 'bg-red-600 text-white border-red-700 backdrop-blur-md bg-opacity-80',
              duration: 4000,
            });
          }
        } catch (error) {
          console.error(error);
          toast.error('Error fetching chat history', {
            className: 'bg-red-600 text-white border-red-700 backdrop-blur-md bg-opacity-80',
            duration: 4000,
          });
        } finally {
          setLoading(false);
        }
      };
      fetchChatHistory();
    } else {
      setMessages([]);
    }
  }, [status, selectedFriend]);

  // Join chat room when a friend is selected
  useEffect(() => {
    if (socket && selectedFriend) {
      socket.emit('joinChat', { recipientId: selectedFriend._id });
    }
  }, [socket, selectedFriend]);

  // Scroll to the latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send a message
  const sendMessage = () => {
    if (!socket || !selectedFriend || !messageInput.trim()) return;
    socket.emit('sendMessage', {
      recipientId: selectedFriend._id,
      content: messageInput,
    });
    setMessageInput('');
  };

  // Send a friend request
  const sendFriendRequest = async (recipientId: string) => {
    try {
      const response = await fetch('/api/send-friend-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientId }),
      });
      const result = await response.json();
      if (result.success) {
        toast.success('Friend request sent successfully', {
          className: 'bg-green-600 text-white border-green-700 backdrop-blur-md bg-opacity-80',
          duration: 4000,
        });
        // Optionally, update UI to reflect that a request has been sent
        setSearchResults(searchResults.filter(user => user._id !== recipientId));
      } else {
        toast.error(result.message || 'Failed to send friend request', {
          className: 'bg-red-600 text-white border-red-700 backdrop-blur-md bg-opacity-80',
          duration: 4000,
        });
      }
    } catch (error) {
      console.error(error);
      toast.error('Error sending friend request', {
        className: 'bg-red-600 text-white border-red-700 backdrop-blur-md bg-opacity-80',
        duration: 4000,
      });
    }
  };

  if (status === 'loading' || loading) {
    return <Loader message="Loading chat..." />;
  }

  if (status === 'unauthenticated') {
    router.push('/sign-in');
    return null;
  }

  return (
    <div
      className="flex h-screen p-4 sm:p-6 md:p-8 mt-16 font-sans relative overflow-hidden"
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

      {/* Friend List Sidebar */}
      <aside
        className={`w-full sm:w-1/3 md:w-1/4 lg:w-1/5 shadow-2xl rounded-3xl overflow-hidden transition-all duration-300 ease-in-out transform relative z-10 ${
          isMobile && selectedFriend ? 'hidden -translate-x-full' : 'translate-x-0'
        }`}
        style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}
      >
        <Card className="h-full bg-transparent flex flex-col border-none">
          <CardContent className="p-5 border-b border-gray-100 shadow-sm">
            <h2 className="text-2xl font-extrabold flex items-center justify-between mb-4" style={{ color: THEME_TEXT_DARK }}>
              Chats
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-gray-100 transition-colors text-blue-500 hover:text-blue-600" // Tailwind colors for hover
              >
                <UserPlus className="w-6 h-6" />
              </Button>
            </h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: THEME_TEXT_LIGHT }} />
              <Input
                placeholder="Search friends or users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 py-2 rounded-full border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all bg-gray-50"
                style={{ color: THEME_TEXT_DARK, borderColor: THEME_TEXT_LIGHT, '--tw-focus-ring-color': `${THEME_SECONDARY_BLUE}33` } as React.CSSProperties}
              />
            </div>
          </CardContent>
          <CardContent className="flex-1 p-0 overflow-y-auto custom-scrollbar">
            {filteredFriends.length === 0 && searchResults.length === 0 && searchQuery ? (
              <p className="text-center py-10 px-4 text-sm" style={{ color: THEME_TEXT_LIGHT }}>
                No friends or users found for &quot;{searchQuery}&quot;.
              </p>
            ) : (
              <ul>
                {/* Display filtered friends */}
                {filteredFriends.map((friend) => (
                  <li
                    key={friend._id}
                    className={`flex items-center p-4 cursor-pointer border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors duration-200 ease-in-out ${
                      selectedFriend?._id === friend._id ? `bg-blue-50 border-l-4 border-blue-500` : '' // Added specific border-blue-500
                    }`}
                    style={{ borderColor: selectedFriend?._id === friend._id ? THEME_SECONDARY_BLUE : undefined }}
                    onClick={() => setSelectedFriend(friend)}
                  >
                    {friend.profilePicture ? (
                      <img
                        src={friend.profilePicture}
                        alt={friend.userName}
                        className="w-12 h-12 rounded-full mr-4 object-cover border-2 shadow-sm"
                        style={{ borderColor: THEME_SECONDARY_BLUE }}
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mr-4 shadow-md"
                        style={{ background: THEME_PRIMARY_DARK_BLUE, color: 'white' }}>
                        {friend.userName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold text-base" style={{ color: THEME_TEXT_DARK }}>{friend.userName}</span>
                      </div>
                    </div>
                  </li>
                ))}
                {/* Display non-friend search results */}
                {searchResults.length > 0 && searchQuery && (
                  <li className="p-4 pt-6 pb-2 text-sm font-semibold" style={{ color: THEME_TEXT_DARK }}>
                    New Users:
                  </li>
                )}
                {searchResults.map((user) => (
                  <li
                    key={user._id}
                    className="flex items-center p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors duration-200 ease-in-out"
                  >
                    {user.profilePicture ? (
                      <img
                        src={user.profilePicture}
                        alt={user.userName}
                        className="w-12 h-12 rounded-full mr-4 object-cover border-2 shadow-sm"
                        style={{ borderColor: THEME_ACCENT_GREEN }}
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mr-4 shadow-md"
                        style={{ background: THEME_ACCENT_GREEN, color: 'white' }}>
                        {user.userName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 flex justify-between items-center">
                      <span className="font-semibold text-base" style={{ color: THEME_TEXT_DARK }}>{user.userName}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full py-1 px-3 text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md bg-yellow-500 hover:bg-yellow-600 text-white" // Tailwind colors for bg and hover
                        onClick={() => sendFriendRequest(user._id)}
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Add
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </aside>

      {/* Chat Area Main Content */}
      <main
        className={`flex-1 shadow-2xl rounded-3xl flex flex-col overflow-hidden relative z-10 ${
          isMobile && !selectedFriend ? 'hidden' : 'ml-0 sm:ml-6'
        }`}
        style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}
      >
        <Card className="flex-1 bg-transparent flex flex-col h-full border-none">
          {selectedFriend ? (
            <>
              {/* Chat Header */}
              <div
                className="flex items-center p-5 border-b border-gray-100 shadow-md"
                style={{ background: `linear-gradient(to right, ${THEME_PRIMARY_DARK_BLUE}, ${THEME_ACCENT_GREEN})`, color: 'white' }}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="mr-3 sm:hidden text-white hover:bg-white hover:bg-opacity-20"
                  onClick={() => setSelectedFriend(null)}
                >
                  <ChevronLeft className="w-6 h-6" />
                </Button>
                {selectedFriend.profilePicture ? (
                  <img
                    src={selectedFriend.profilePicture}
                    alt={selectedFriend.userName}
                    className="w-12 h-12 rounded-full mr-4 object-cover border-2 border-white shadow-sm"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-white bg-opacity-30 text-white flex items-center justify-center text-xl font-bold mr-4 border-2 border-white shadow-sm">
                    {selectedFriend.userName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1">
                  <h2 className="text-xl font-semibold">{selectedFriend.userName}</h2>
                  <p className="text-sm opacity-80">Online</p> {/* This 'Online' status would ideally be dynamic */}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white hover:bg-opacity-20"
                >
                  <MoreVertical className="w-6 h-6" />
                </Button>
              </div>

              {/* Messages Display Area */}
              <CardContent className="flex-1 p-6 overflow-y-auto custom-scrollbar" style={{ backgroundColor: `${THEME_BACKGROUND_LIGHT}D0` }}>
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <MessageSquare className="w-24 h-24 mb-6" style={{ color: THEME_SECONDARY_BLUE, opacity: 0.6 }} />
                    <p className="text-xl font-semibold mb-2" style={{ color: THEME_TEXT_DARK }}>Start a conversation!</p>
                    <p className="text-md text-center max-w-sm" style={{ color: THEME_TEXT_LIGHT }}>
                      Send your first message to {selectedFriend.userName} and begin chatting.
                    </p>
                  </div>
                ) : (
                  messages
                    .filter(
                      (msg) =>
                        (msg.senderId === session?.user._id && msg.recipientId === selectedFriend._id) ||
                        (msg.senderId === selectedFriend._id && msg.recipientId === session?.user._id)
                    )
                    .map((msg, index) => (
                      <div
                        key={index}
                        className={`mb-4 flex ${
                          msg.senderId === session?.user._id ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-[75%] p-4 rounded-2xl shadow-md relative group transition-transform transform hover:scale-[1.01] duration-200 ease-out`}
                          style={{
                            backgroundColor: msg.senderId === session?.user._id ? 'white' : THEME_SECONDARY_BLUE,
                            color: msg.senderId === session?.user._id ? THEME_TEXT_DARK : 'white',
                            border: msg.senderId === session?.user._id ? `1px solid ${THEME_BACKGROUND_LIGHT}` : 'none',
                          }}
                        >
                          <p className="text-base leading-snug break-words">{msg.content}</p>
                          <p
                            className={`text-xs mt-1 text-right ${
                              msg.senderId === session?.user._id ? 'text-gray-500' : 'text-blue-100' // Use standard gray/blue for timestamps
                            }`}
                          >
                            {new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                    ))
                )}
                <div ref={messagesEndRef} />
              </CardContent>

              {/* Message Input Area */}
              <div className="p-5 border-t border-gray-100 shadow-lg" style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)' }}>
                <div className="flex items-center space-x-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-600" // Tailwind colors for hover
                  >
                    <Smile className="w-6 h-6" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-600" // Tailwind colors for hover
                  >
                    <Paperclip className="w-6 h-6" />
                  </Button>
                  <Input
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 p-3 rounded-full border border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all bg-gray-50 pr-12"
                    style={{ color: THEME_TEXT_DARK, borderColor: THEME_TEXT_LIGHT, '--tw-focus-ring-color': `${THEME_SECONDARY_BLUE}33` } as React.CSSProperties}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  />
                  <Button
                    onClick={sendMessage}
                    className="p-3 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 bg-blue-500 hover:bg-blue-600 text-white" // Tailwind colors for bg and hover
                    size="icon"
                  >
                    <Send className="w-6 h-6" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <Image src={img1} alt="Welcome Chat" className="w-32 h-32 mb-6 animate-bounce-slow" />
              <p className="text-2xl font-bold mb-3" style={{ color: THEME_TEXT_DARK }}>
                Welcome to your Student Chat Hub!
              </p>
              <p className="text-lg max-w-lg leading-relaxed" style={{ color: THEME_TEXT_LIGHT }}>
                Connect with fellow students, share ideas, and collaborate on projects. Select a friend
                from the sidebar to start a private conversation or click the{' '}
                <UserPlus className="inline w-5 h-5 mb-1" style={{ color: THEME_SECONDARY_BLUE }} /> icon to add new connections.
              </p>
            </div>
          )}
        </Card>
      </main>
    </div>
  );
};

export default Chat;