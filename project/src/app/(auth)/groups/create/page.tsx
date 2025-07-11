'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { CldUploadWidget } from 'next-cloudinary';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ImageIcon } from 'lucide-react';
import Loader from '@/components/Loader';

const CreateGroup: React.FC = () => {
  const { status } = useSession();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    privacy: 'public' as 'public' | 'private',
    coverImage: '',
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePrivacyChange = (value: 'public' | 'private') => {
    setFormData((prev) => ({ ...prev, privacy: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/groups/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (result.success) {
        toast.success('Group created successfully', {
          className: 'bg-green-600 text-white border-green-700 backdrop-blur-md bg-opacity-80',
          duration: 4000,
        });
        router.push('/groups');
      } else {
        toast.error(result.message || 'Failed to create group', {
          className: 'bg-red-600 text-white border-red-700 backdrop-blur-md bg-opacity-80',
          duration: 4000,
        });
      }
    } catch (error) {
      toast.error('Error creating group', {
        className: 'bg-red-600 text-white border-red-700 backdrop-blur-md bg-opacity-80',
        duration: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return <Loader message="Loading..." />;
  }

  if (status === 'unauthenticated') {
    router.push('/sign-in');
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <Card className="w-full max-w-md bg-white shadow-xl rounded-lg">
        <CardContent className="p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Create a New Group
          </h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="name" className="text-gray-700 font-medium">
                Group Name
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter group name"
                className="mt-1 p-3 rounded-full border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-300 transition-all"
                required
              />
            </div>
            <div>
              <Label htmlFor="description" className="text-gray-700 font-medium">
                Description
              </Label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your group"
                className="mt-1 w-full p-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-300 transition-all resize-none h-32"
                required
              />
            </div>
            <div>
              <Label className="text-gray-700 font-medium">Privacy</Label>
              <RadioGroup
                value={formData.privacy}
                onValueChange={handlePrivacyChange}
                className="mt-2 flex space-x-4"
              >
                <div className="flex items-center">
                  <RadioGroupItem value="public" id="public" />
                  <Label htmlFor="public" className="ml-2 text-gray-600">
                    Public
                  </Label>
                </div>
                <div className="flex items-center">
                  <RadioGroupItem value="private" id="private" />
                  <Label htmlFor="private" className="ml-2 text-gray-600">
                    Private
                  </Label>
                </div>
              </RadioGroup>
            </div>
            <div>
              <Label htmlFor="coverImage" className="text-gray-700 font-medium">
                Cover Image
              </Label>
              <CldUploadWidget
                uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
                options={{
                  folder: 'group_covers',
                  sources: ['local', 'url', 'camera'],
                  multiple: false,
                  resourceType: 'image',
                }}
                onSuccess={(result: any) => {
                  const secureUrl = result?.info?.secure_url;
                  if (secureUrl) {
                    setFormData((prev) => ({ ...prev, coverImage: secureUrl }));
                    toast.success('Cover image uploaded successfully', {
                      className: 'bg-green-600 text-white border-green-700 backdrop-blur-md bg-opacity-80',
                      duration: 4000,
                    });
                  }
                }}
                onError={(error: any) => {
                  toast.error('Failed to upload cover image', {
                    className: 'bg-red-600 text-white border-red-700 backdrop-blur-md bg-opacity-80',
                    duration: 4000,
                  });
                }}
              >
                {({ open }) => (
                  <Button
                    type="button"
                    onClick={() => open()}
                    className="mt-1 w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 rounded-full transition-all duration-300"
                  >
                    <ImageIcon className="w-5 h-5 mr-2" />
                    Upload Cover Image
                  </Button>
                )}
              </CldUploadWidget>
              {formData.coverImage && (
                <img
                  src={formData.coverImage}
                  alt="Cover Preview"
                  className="mt-2 w-full h-32 object-cover rounded-lg shadow-sm"
                />
              )}
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#5095d1] to-[#2e619f] hover:from-[#5095d1] hover:to-[#497ec0] text-white font-semibold py-3 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Group'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateGroup;