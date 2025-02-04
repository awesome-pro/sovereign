"use client";

import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { UserProfile } from '@/types/profile';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Pencil, Loader2 } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { useAuthContext } from '@/providers/auth-provider';
import { cn } from '@/lib/utils';

interface ProfileHeaderProps {
  profile: UserProfile;
  onEditBasicInfo: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  profile,
  onEditBasicInfo,
}) => {
  const { 
    uploadAvatar, 
    uploadCoverImage, 
    avatarUploading, 
    coverImageUploading 
  } = useProfile();

  const { user } = useAuthContext();

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverImageInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await uploadAvatar(file);
      if (avatarInputRef.current) {
        avatarInputRef.current.value = '';
      }
    }
  };

  const handleCoverImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await uploadCoverImage(file);
      if (coverImageInputRef.current) {
        coverImageInputRef.current.value = '';
      }
    }
  };

  const triggerAvatarUpload = () => {
    avatarInputRef.current?.click();
  };

  const triggerCoverImageUpload = () => {
    coverImageInputRef.current?.click();
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative rounded-2xl overflow-hidden shadow-lg bg-white"
    >
      {/* Cover Image Section */}
      <div className="relative h-48 md:h-64 group">
        {profile.coverImage ? (
          <img
            src={profile.coverImage}
            alt="Cover"
            className="w-full h-full object-cover transition-all duration-300 group-hover:brightness-90"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-blue-100 to-blue-200 opacity-80" />
        )}
        
        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <input
            ref={coverImageInputRef}
            type="file"
            className="hidden"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={handleCoverImageChange}
            disabled={coverImageUploading}
          />
          <Button 
            size="sm" 
            variant="secondary" 
            onClick={triggerCoverImageUpload}
            disabled={coverImageUploading}
            className="bg-white/80 hover:bg-white"
          >
            {coverImageUploading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin text-primary" />
            ) : (
              <Camera className="h-4 w-4 mr-2 text-primary" />
            )}
            {coverImageUploading ? 'Uploading...' : 'Change Cover'}
          </Button>
        </div>
      </div>

      {/* Profile Info Section */}
      <div className="px-6 pb-6 pt-16 md:pt-20 relative">
        <div className="absolute -top-16 md:-top-20 left-6 z-10">
          <div className="relative group">
            <Avatar className="h-32 w-32 md:h-40 md:w-40 ring-4 ring-white shadow-lg">
              <AvatarImage 
                src={user?.avatar || ''} 
                alt={profile.displayName || 'Profile Avatar'}
                className="object-cover transition-all duration-300 group-hover:brightness-90"
              />
              <AvatarFallback className="bg-primary text-white text-4xl">
                {user?.name?.[0] || profile.lastName[0]}
              </AvatarFallback>
            </Avatar>
            
            <div className="absolute bottom-0 right-0">
              <input
                ref={avatarInputRef}
                type="file"
                className="hidden"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleAvatarChange}
                disabled={avatarUploading}
              />
              <Button 
                size="icon" 
                variant="secondary" 
                className="rounded-full bg-white/80 hover:bg-white shadow-md"
                onClick={triggerAvatarUpload}
                disabled={avatarUploading}
              >
                {avatarUploading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                ) : (
                  <Camera className="h-4 w-4 text-primary" />
                )}
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
          <div className="pl-36 md:pl-44 space-y-2">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              {profile.displayName || `${profile.user?.name} ${profile.lastName}`}
            </h1>
            <p className="text-sm md:text-base text-gray-500">
              {profile.title || 'Real Estate Professional'}
            </p>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onEditBasicInfo}
            className="flex items-center space-x-2 border-primary text-primary hover:bg-primary/10"
          >
            <Pencil className="h-4 w-4" />
            <span>Edit Profile</span>
          </Button>
        </div>

        {profile.bio && (
          <div className="mt-4 text-gray-600 max-w-2xl">
            <p className="text-sm md:text-base">{profile.bio}</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};
