'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CldUploadWidget } from 'next-cloudinary';
import { toast } from 'sonner';
import { z } from 'zod';
import { updateProfileSchema } from '@/schemas/updateProfileSchema';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

const ProfileSettings = () => {
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(null);
  const [coverPhotoUrl, setCoverPhotoUrl] = useState<string | null>(null);
  const [newSkill, setNewSkill] = useState<string>('');
  const router = useRouter()

  const form = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      userName: '',
      university: '',
      graduationYear: undefined,
      skills: [],
      headline: '',
      profilePicture: '',
      coverPhoto: '',
    },
  });

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/get-updated-field', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        const result = await response.json();
        if (result.success && result.data) {
          form.reset({
            userName: result.data.userName || '',
            university: result.data.university || '',
            graduationYear: result.data.graduationYear || undefined,
            skills: result.data.skills || [],
            headline: result.data.headline || '',
            profilePicture: result.data.profilePicture || '',
            coverPhoto: result.data.coverPhoto || '',
          });
          setProfilePictureUrl(result.data.profilePicture || null);
          setCoverPhotoUrl(result.data.coverPhoto || null);

         
          
        } else {
          toast.error('Error', {
            description: result.message || 'Failed to fetch profile data.',
            className: 'bg-red-600 text-white border-red-700 backdrop-blur-md bg-opacity-80',
            duration: 4000,
          });
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Error', {
          description: 'Failed to fetch profile data.',
          className: 'bg-red-600 text-white border-red-700 backdrop-blur-md bg-opacity-80',
          duration: 4000,
        });
      }
    };

    fetchUserData();
  }, [form]);

  const onSubmit = async (data: UpdateProfileInput) => {
    try {
      const response = await fetch('/api/update-profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          profilePicture: profilePictureUrl || data.profilePicture,
          coverPhoto: coverPhotoUrl || data.coverPhoto,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Success', {
          description: 'Profile updated successfully!',
          className: 'bg-green-600 text-white border-green-700 backdrop-blur-md bg-opacity-80',
          duration: 4000,
        });
        form.reset({
          ...data,
          profilePicture: profilePictureUrl || '',
          coverPhoto: coverPhotoUrl || '',
        });

         setTimeout(() => {
          router.replace(`/profile`);
        }, 2000);
      } else {
        toast.error('Error', {
          description: result.message,
          className: 'bg-red-600 text-white border-red-700 backdrop-blur-md bg-opacity-80',
          duration: 4000,
        });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Error', {
        description: 'Failed to update profile.',
        className: 'bg-red-600 text-white border-red-700 backdrop-blur-md bg-opacity-80',
        duration: 4000,
      });
    }
  };

  const handleAddSkill = () => {
    if (newSkill.trim()) {
      const currentSkills = form.getValues('skills') || [];
      if (currentSkills.length >= 20) {
        toast.error('Limit Reached', {
          description: 'Cannot add more than 20 skills.',
          className: 'bg-red-600 text-white border-red-700 backdrop-blur-md bg-opacity-80',
          duration: 4000,
        });
        return;
      }
      if (newSkill.length > 50) {
        toast.error('Invalid Skill', {
          description: 'Each skill cannot exceed 50 characters.',
          className: 'bg-red-600 text-white border-red-700 backdrop-blur-md bg-opacity-80',
          duration: 4000,
        });
        return;
      }
      if (!currentSkills.includes(newSkill.trim())) {
        form.setValue('skills', [...currentSkills, newSkill.trim()]);
        setNewSkill('');
      } else {
        toast.warning('Duplicate Skill', {
          description: 'This skill is already added.',
          className: 'bg-yellow-600 text-white border-yellow-700 backdrop-blur-md bg-opacity-80',
          duration: 4000,
        });
      }
    }
  };

  const handleRemoveSkill = (skill: string) => {
    const currentSkills = form.getValues('skills') || [];
    form.setValue('skills', currentSkills.filter((s) => s !== skill));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <Card className="w-full max-w-md bg-white border-none shadow-none">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-3xl font-bold text-gray-800">Update Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Username Field */}
              <FormField
                control={form.control}
                name="userName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-medium">Username</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your username"
                        {...field}
                        className="border border-gray-300 focus:ring-blue-500 focus:border-blue-500 rounded-lg p-2.5 w-full"
                      />
                    </FormControl>
                    <FormMessage className="text-red-500 text-sm mt-1" />
                  </FormItem>
                )}
              />

              {/* Profile Picture Upload */}
              <FormField
                control={form.control}
                name="profilePicture"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-medium">Profile Picture</FormLabel>
                    <FormControl>
                      <div className="flex flex-col items-center">
                        <CldUploadWidget
                          uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
                          options={{
                            maxFiles: 1,
                            resourceType: 'image',
                            clientAllowedFormats: ['jpg', 'png', 'jpeg'],
                            maxFileSize: 5 * 1024 * 1024, // 5MB
                          }}
                          onSuccess={(result: any) => {
                            const secureUrl = result?.info?.secure_url;
                            if (secureUrl) {
                              setProfilePictureUrl(secureUrl);
                              field.onChange(secureUrl);
                              toast.success('Image Uploaded', {
                                description: 'Profile picture uploaded successfully!',
                                className:
                                  'bg-green-600 text-white border-green-700 backdrop-blur-md bg-opacity-80',
                                duration: 4000,
                              });
                            }
                          }}
                          onError={(error) => {
                            toast.error('Upload Error', {
                              description: 'Failed to upload profile periods picture. Please try again.',
                              className:
                                'bg-red-600 text-white border-red-700 backdrop-blur-md bg-opacity-80',
                              duration: 4000,
                            });
                          }}
                        >
                          {({ open }) => (
                            <Button
                              type="button"
                              onClick={() => open()}
                              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg"
                            >
                              Upload Profile Picture
                            </Button>
                          )}
                        </CldUploadWidget>
                        {profilePictureUrl && (
                          <div className="mt-4">
                            <img
                              src={profilePictureUrl}
                              alt="Profile Preview"
                              className="w-32 h-32 object-cover rounded-full border border-gray-300"
                            />
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-500 text-sm mt-1" />
                  </FormItem>
                )}
              />

              {/* Cover Photo Upload */}
              <FormField
                control={form.control}
                name="coverPhoto"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-medium">Cover Photo</FormLabel>
                    <FormControl>
                      <div className="flex flex-col items-center">
                        <CldUploadWidget
                          uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
                          options={{
                            maxFiles: 1,
                            resourceType: 'image',
                            clientAllowedFormats: ['jpg', 'png', 'jpeg'],
                            maxFileSize: 10 * 1024 * 1024, // 10MB for cover photo
                          }}
                          onSuccess={(result: any) => {
                            const secureUrl = result?.info?.secure_url;
                            if (secureUrl) {
                              setCoverPhotoUrl(secureUrl);
                              field.onChange(secureUrl);
                              toast.success('Image Uploaded', {
                                description: 'Cover photo uploaded successfully!',
                                className:
                                  'bg-green-600 text-white border-green-700 backdrop-blur-md bg-opacity-80',
                                duration: 4000,
                              });
                            }
                          }}
                          onError={(error) => {
                            toast.error('Upload Error', {
                              description: 'Failed to upload cover photo. Please try again.',
                              className:
                                'bg-red-600 text-white border-red-700 backdrop-blur-md bg-opacity-80',
                              duration: 4000,
                            });
                          }}
                        >
                          {({ open }) => (
                            <Button
                              type="button"
                              onClick={() => open()}
                              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg"
                            >
                              Upload Cover Photo
                            </Button>
                          )}
                        </CldUploadWidget>
                        {coverPhotoUrl && (
                          <div className="mt-4">
                            <img
                              src={coverPhotoUrl}
                              alt="Cover Photo Preview"
                              className="w-full h-32 object-cover rounded-lg border border-gray-300"
                            />
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-500 text-sm mt-1" />
                  </FormItem>
                )}
              />

              {/* University Field */}
              <FormField
                control={form.control}
                name="university"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-medium">University</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your university"
                        {...field}
                        className="border border-gray-300 focus:ring-blue-500 focus:border-blue-500 rounded-lg p-2.5 w-full"
                        
                      />
                      
                    </FormControl>
                    <FormMessage className="text-red-500 text-sm mt-1" />
                  </FormItem>
                )}
              />

              {/* Graduation Year Field */}
              <FormField
                control={form.control}
                name="graduationYear"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-medium">Graduation Year</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter your graduation year"
                        {...field}
                        value={field.value || ''} // Handle undefined value
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                        className="border border-gray-300 focus:ring-blue-500 focus:border-blue-500 rounded-lg p-2.5 w-full"
                      />
                    </FormControl>
                    <FormMessage className="text-red-500 text-sm mt-1" />
                  </FormItem>
                )}
              />

              {/* Skills Field */}
              <FormField
                control={form.control}
                name="skills"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-medium">Skills</FormLabel>
                    <p className="text-sm text-gray-500 mb-2">
                      Enter skills one at a time and click "Add" to include them in your profile (max 20 skills, 50 characters each).
                    </p>
                    <FormControl>
                      <div className="flex flex-col space-y-2">
                        <div className="flex space-x-2">
                          <Input
                            placeholder="Enter a skill"
                            value={newSkill}
                            onChange={(e) => setNewSkill(e.target.value)}
                            className="border border-gray-300 focus:ring-blue-500 focus:border-blue-500 rounded-lg p-2.5 flex-1"
                          />
                          <Button
                            type="button"
                            onClick={handleAddSkill}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg"
                          >
                            Add
                          </Button>
                        </div>
                        {field.value && field.value.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {field.value.map((skill) => (
                              <div
                                key={skill}
                                className="flex items-center bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded-full"
                              >
                                {skill}
                                <button
                                  type="button"
                                  onClick={() => handleRemoveSkill(skill)}
                                  className="ml-2 text-blue-600 hover:text-blue-800"
                                >
                                  ✕
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-500 text-sm mt-1" />
                  </FormItem>
                )}
              />

              {/* Headline Field */}
              <FormField
                control={form.control}
                name="headline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-medium">Headline</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell us about yourself"
                        {...field}
                        className="border border-gray-300 focus:ring-blue-500 focus:border-blue-500 rounded-lg p-2.5 w-full min-h-[100px]"
                      />
                    </FormControl>
                    <FormMessage className="text-red-500 text-sm mt-1" />
                  </FormItem>
                )}
              />

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? 'Updating...' : 'Update Profile'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileSettings;