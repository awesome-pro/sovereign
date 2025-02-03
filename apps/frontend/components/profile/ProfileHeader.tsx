import React from 'react';
import { UserProfile } from '@/types/profile';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Pencil } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';

interface ProfileHeaderProps {
  profile: UserProfile;
  onEditBasicInfo: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  profile,
  onEditBasicInfo,
}) => {
  const { uploadAvatar, uploadCoverImage } = useProfile();

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await uploadAvatar(file);
    }
  };

  const handleCoverImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await uploadCoverImage(file);
    }
  };

  return (
    <div className="relative mb-8">
      {/* Cover Image */}
      <div className="relative h-48 md:h-64 rounded-lg overflow-hidden bg-gray-100">
        {profile.coverImage ? (
          <img
            src={profile.coverImage}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-blue-100 to-blue-200" />
        )}
        <label className="absolute bottom-4 right-4 cursor-pointer">
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleCoverImageChange}
          />
          <Button size="sm" variant="secondary">
            <Camera className="h-4 w-4 mr-2" />
            Change Cover
          </Button>
        </label>
      </div>

      {/* Profile Info */}
      <div className="relative px-4 sm:px-6 lg:px-8 -mt-16">
        <div className="flex flex-col sm:flex-row items-center sm:items-end space-y-4 sm:space-y-0 sm:space-x-6">
          {/* Avatar */}
          <div className="relative">
            <Avatar className="h-32 w-32 ring-4 ring-white">
              <AvatarImage src={profile.user?.avatar || ''} />
              <AvatarFallback>
                {profile.displayName?.[0] || profile.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <label className="absolute bottom-0 right-0 cursor-pointer">
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleAvatarChange}
              />
              <Button size="icon" variant="secondary" className="rounded-full">
                <Camera className="h-4 w-4" />
              </Button>
            </label>
          </div>

          {/* Profile Details */}
          <div className="flex-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold">
                  {profile.displayName || `${profile.user?.name} ${profile.lastName}`}
                </h1>
                <p className="text-gray-500">{profile.title || 'Real Estate Professional'}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={onEditBasicInfo}
                className="hidden sm:flex"
              >
                <Pencil className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </div>
            <p className="mt-2 text-gray-600 max-w-2xl">{profile.bio}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
