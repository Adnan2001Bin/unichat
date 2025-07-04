'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CldUploadWidget } from 'next-cloudinary';
import { Loader2, ImageIcon, Tag, School, FileText } from 'lucide-react';
import { useSession } from 'next-auth/react';

const GroupCreationForm: React.FC = () => {
  const router = useRouter();
  const { status } = useSession();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    university: '',
    coverImage: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.name) newErrors.name = 'Group name is required';
    else if (formData.name.length < 3) newErrors.name = 'Group name must be at least 3 characters';
    else if (formData.name.length > 100) newErrors.name = 'Group name cannot exceed 100 characters';
    
    if (formData.description && formData.description.length > 500)
      newErrors.description = 'Description cannot exceed 500 characters';
    if (formData.university && formData.university.length > 100)
      newErrors.university = 'University name cannot exceed 100 characters';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status !== 'authenticated') {
      toast.error('Error', {
        description: 'You must be logged in to create a group',
        className: 'bg-red-600 text-white border-red-700 backdrop-blur-md bg-opacity-80',
        duration: 4000,
      });
      return;
    }

    if (!validateForm()) {
      toast.error('Error', {
        description: 'Please fix the form errors before submitting',
        className: 'bg-red-600 text-white border-red-700 backdrop-blur-md bg-opacity-80',
        duration: 4000,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/groups/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
        }),
      });

      const result = await response.json();
      if (result.success) {
        toast.success('Success', {
          description: result.message,
          className: 'bg-green-600 text-white border-green-700 backdrop-blur-md bg-opacity-80',
          duration: 4000,
        });
        router.push('/groups');
      } else {
        toast.error('Error', {
          description: result.message || 'Failed to create group',
          className: 'bg-red-600 text-white border-red-700 backdrop-blur-md bg-opacity-80',
          duration: 4000,
        });
      }
    } catch (error) {
      toast.error('Error', {
        description: 'Failed to create group',
        className: 'bg-red-600 text-white border-red-700 backdrop-blur-md bg-opacity-80',
        duration: 4000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4 sm:p-6"
    >
      <Card className="w-full mt-20 max-w-xl mx-auto shadow-2xl rounded-2xl overflow-hidden bg-white/95 backdrop-blur-md border border-gray-100">
        <CardHeader className="bg-[#DCA06D] text-white p-6 sm:p-8">
          <CardTitle className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-3">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a2 2 0 00-2-2h-3m-2 4H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V16a2 2 0 01-2 2h-1" />
            </svg>
            Create Your Group
          </CardTitle>
          <p className="text-sm sm:text-base opacity-90 mt-2">Start a community for collaboration and networking</p>
        </CardHeader>
        <CardContent className="p-6 sm:p-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Group Name */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Label htmlFor="name" className="text-gray-800 font-medium flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#DCA06D]" /> Group Name
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Coding Enthusiasts"
                className={`mt-2 border ${errors.name ? 'border-red-500' : 'border-gray-200'} focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 rounded-xl bg-gray-50/50 text-gray-900 placeholder-gray-400 shadow-sm`}
              />
              {errors.name && <p className="text-red-500 text-sm mt-1.5">{errors.name}</p>}
            </motion.div>

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <Label htmlFor="description" className="text-gray-800 font-medium flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#DCA06D]" /> Description
              </Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your group’s purpose (optional)"
                className={`mt-2 border ${errors.description ? 'border-red-500' : 'border-gray-200'} focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 rounded-xl bg-gray-50/50 text-gray-900 placeholder-gray-400 shadow-sm resize-none h-28`}
              />
              {errors.description && <p className="text-red-500 text-sm mt-1.5">{errors.description}</p>}
            </motion.div>

            {/* University */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <Label htmlFor="university" className="text-gray-800 font-medium flex items-center gap-2">
                <School className="h-5 w-5 text-[#DCA06D]" /> University
              </Label>
              <Input
                id="university"
                name="university"
                value={formData.university}
                onChange={handleInputChange}
                placeholder="e.g., University of Example (optional)"
                className={`mt-2 border ${errors.university ? 'border-red-500' : 'border-gray-200'} focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 rounded-xl bg-gray-50/50 text-gray-900 placeholder-gray-400 shadow-sm`}
              />
              {errors.university && <p className="text-red-500 text-sm mt-1.5">{errors.university}</p>}
            </motion.div>


            {/* Cover Image */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.5 }}
            >
              <Label className="text-gray-800 font-medium flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-[#DCA06D]" /> Group Cover Image
              </Label>
              <CldUploadWidget
                uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
                onSuccess={(result: any) => {
                  const secureUrl = result?.info?.secure_url;
                  if (secureUrl) {
                    setFormData((prev) => ({ ...prev, coverImage: secureUrl }));
                    setCoverImagePreview(secureUrl);
                  }
                }}
              >
                {({ open }) => (
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="mt-2"
                  >
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full flex items-center justify-center gap-2 border-gray-200 hover:bg-blue-50 hover:border-blue-500 text-[#DCA06D] font-medium transition-all duration-300 rounded-xl shadow-sm"
                      onClick={() => open()}
                    >
                      <ImageIcon className="h-5 w-5" />
                      {coverImagePreview ? 'Change Cover Image' : 'Upload Cover Image'}
                    </Button>
                  </motion.div>
                )}
              </CldUploadWidget>
              {coverImagePreview ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="mt-3 relative"
                >
                  <img
                    src={coverImagePreview}
                    alt="Cover Image Preview"
                    className="w-full h-48 object-cover rounded-xl shadow-lg"
                  />
                  <Button
                    variant="ghost"
                    className="absolute top-2 right-2 text-white bg-black/60 hover:bg-black/80 rounded-full p-2 transition-all duration-200"
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, coverImage: '' }));
                      setCoverImagePreview(null);
                    }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </Button>
                </motion.div>
              ) : (
                <div className="mt-3 w-full h-48 bg-[#FEFAE0] flex items-center justify-center rounded-xl shadow-lg">
                  <ImageIcon className="h-12 w-12 text-[#DCA06D]" />
                </div>
              )}
            </motion.div>

            {/* Submit Button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#DCA06D] hover:bg-[#A55B4B] text-white font-semibold py-3 rounded-xl transition-all duration-300 ease-in-out shadow-lg"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Creating...
                  </span>
                ) : (
                  'Create Group'
                )}
              </Button>
            </motion.div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default GroupCreationForm;