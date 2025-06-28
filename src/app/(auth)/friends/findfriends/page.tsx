'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { UserCircle, UserPlus, UserCheck, UserX } from 'lucide-react';
import Loader from '@/components/Loader';

const searchSchema = z.object({
  query: z.string().min(1, 'Search query is required').trim(),
});

type SearchInput = z.infer<typeof searchSchema>;

export default function AddFriendPage() {
  const { data: session, status } = useSession();
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [friendsData, setFriendsData] = useState<{
    connections: any[];
    pendingSentRequests: any[];
    pendingReceivedRequests: any[];
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const form = useForm<SearchInput>({
    resolver: zodResolver(searchSchema),
    defaultValues: { query: '' },
  });

  useEffect(() => {
    const fetchFriendsData = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/list_friends_and_pending_requests');
        const result = await response.json();
        if (result.success) {
          setFriendsData(result.data);
        } else {
          toast.error('Error', {
            description: result.message || 'Failed to fetch friends data',
            className: 'bg-red-600 text-white border-red-700 backdrop-blur-md bg-opacity-80',
            duration: 4000,
          });
        }
      } catch (error) {
        toast.error('Error', {
          description: 'Failed to fetch friends data',
          className: 'bg-red-600 text-white border-red-700 backdrop-blur-md bg-opacity-80',
          duration: 4000,
        });
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated') {
      fetchFriendsData();
    }
  }, [status]);

  const onSearch = async (data: SearchInput) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/friendSearch?query=${encodeURIComponent(data.query)}`);
      const result = await response.json();
      if (result.success) {
        setSearchResults(result.data);
      } else {
        toast.error('Error', {
          description: result.message || 'Failed to search users',
          className: 'bg-red-600 text-white border-red-700 backdrop-blur-md bg-opacity-80',
          duration: 4000,
        });
      }
    } catch (error) {
      toast.error('Error', {
        description: 'Failed to search users',
        className: 'bg-red-600 text-white border-red-700 backdrop-blur-md bg-opacity-80',
        duration: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async (recipientId: string) => {
    try {
      const response = await fetch('/api/send-friend-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientId }),
      });
      const result = await response.json();
      if (result.success) {
        toast.success('Success', {
          description: result.message,
          className: 'bg-emerald-600 text-white border-emerald-700 backdrop-blur-md bg-opacity-80',
          duration: 4000,
        });
        form.reset();
        setSearchResults([]);
        setFriendsData((prev) =>
          prev
            ? {
                ...prev,
                pendingSentRequests: [
                  ...prev.pendingSentRequests,
                  { _id: recipientId },
                ],
              }
            : prev
        );
      } else {
        toast.error('Error', {
          description: result.message,
          className: 'bg-red-600 text-white border-red-700 backdrop-blur-md bg-opacity-80',
          duration: 4000,
        });
      }
    } catch (error) {
      toast.error('Error', {
        description: 'Failed to send friend request',
        className: 'bg-red-600 text-white border-red-700 backdrop-blur-md bg-opacity-80',
        duration: 4000,
      });
    }
  };

  if (status === 'loading') {
    return <Loader message="Loading session..." />;
  }

  if (!session) {
    router.push('/sign-in');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 p-4 sm:p-6 lg:p-8 mt-15">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-white shadow-xl rounded-2xl overflow-hidden border border-emerald-100">
          <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white p-6">
            <CardTitle className="text-3xl font-bold tracking-tight">
              Add Friends
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {loading ? (
              <Loader message="Searching users..." />
            ) : (
              <>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSearch)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="query"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-medium">Search Users</FormLabel>
                          <div className="flex space-x-2">
                            <FormControl>
                              <Input
                                placeholder="Enter username"
                                {...field}
                                className="border border-emerald-200 focus:ring-emerald-500 focus:border-emerald-500 rounded-lg p-2.5 w-full bg-emerald-50 text-gray-800 placeholder-gray-400"
                              />
                            </FormControl>
                            <Button
                              type="submit"
                              disabled={loading}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200"
                            >
                              {loading ? 'Searching...' : 'Search'}
                            </Button>
                          </div>
                          <FormMessage className="text-red-500 text-sm mt-1" />
                        </FormItem>
                      )}
                    />
                  </form>
                </Form>
                <div className="mt-6 space-y-4">
                  {searchResults.map((user) => {
                    const isFriend = friendsData?.connections.some(
                      (friend) => friend._id.toString() === user._id
                    );
                    const isPendingSent = friendsData?.pendingSentRequests.some(
                      (req) => req._id.toString() === user._id
                    );
                    const isPendingReceived = friendsData?.pendingReceivedRequests.some(
                      (req) => req._id.toString() === user._id
                    );

                    return (
                      <div
                        key={user._id}
                        className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 ease-in-out animate-fade-in"
                      >
                        <div className="flex items-center space-x-4">
                          {user.profilePicture ? (
                            <img
                              src={user.profilePicture}
                              alt={user.userName}
                              className="w-14 h-14 rounded-full border-2 border-emerald-200 object-cover"
                            />
                          ) : (
                            <UserCircle className="w-14 h-14 text-emerald-500" />
                          )}
                          <div>
                            <p className="text-lg font-semibold text-gray-800">{user.userName}</p>
                            {user.university && <p className="text-sm text-gray-600">{user.university}</p>}
                            {user.headline && <p className="text-sm text-gray-500 italic">{user.headline}</p>}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {isFriend ? (
                            <span className="flex items-center text-emerald-600 font-semibold">
                              <UserCheck className="w-5 h-5 mr-1" /> Friend
                            </span>
                          ) : isPendingSent ? (
                            <span className="flex items-center text-blue-600 font-semibold">
                              <UserPlus className="w-5 h-5 mr-1" /> Request Sent
                            </span>
                          ) : isPendingReceived ? (
                            <span className="flex items-center text-purple-600 font-semibold">
                              <UserX className="w-5 h-5 mr-1" /> Request Received
                            </span>
                          ) : (
                            <Button
                              onClick={() => handleSendRequest(user._id)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200"
                            >
                              Send Friend Request
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {searchResults.length === 0 && !loading && form.formState.isSubmitted && (
                    <p className="text-center text-gray-600 text-lg py-8 animate-fade-in">
                      No users found
                    </p>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}