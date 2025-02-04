"use client";

import React from 'react';
import { Metadata } from 'next';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { BasicInfoForm } from '@/components/profile/BasicInfoForm';
import { useProfile } from '@/hooks/useProfile';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { UpdateProfileInput } from '@/types/profile';

export default function ProfilePage() {
  const {
    profile,
    loading,
    error,
    updateProfile,
  } = useProfile();

  const [isEditing, setIsEditing] = React.useState(false);

  const handleUpdateProfile = async (data: UpdateProfileInput) => {
    await updateProfile(data);
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-48 w-full" />
        <div className="space-y-4">
          <Skeleton className="h-12 w-[250px]" />
          <Skeleton className="h-4 w-[300px]" />
          <Skeleton className="h-4 w-[250px]" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Error loading profile: {error.message}</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-8">
        <p>Profile not found</p>
      </div>
    );
  }

  return (
    <div className="mx-auto py-8 w-full">
      <ProfileHeader
        profile={profile}
        onEditBasicInfo={() => setIsEditing(true)}
      />

      <Tabs defaultValue="basic-info" className="mt-8">
        <TabsList>
          <TabsTrigger value="basic-info">Basic Info</TabsTrigger>
          <TabsTrigger value="licenses">Licenses</TabsTrigger>
          <TabsTrigger value="certifications">Certifications</TabsTrigger>
          <TabsTrigger value="languages">Languages</TabsTrigger>
        </TabsList>

        <TabsContent value="basic-info">
          <Card>
            <CardContent className="pt-6">
              {isEditing ? (
                <BasicInfoForm
                  defaultValues={{
                    lastName: profile.lastName,
                    displayName: profile.displayName,
                    bio: profile.bio,
                    title: profile.title,
                    gender: profile.gender,
                    nationality: profile.nationality,
                    secondaryEmail: profile.secondaryEmail,
                    secondaryPhone: profile.secondaryPhone,
                    whatsapp: profile.whatsapp,
                    experience: profile.experience,
                    timeZone: profile.timeZone,
                    currency: profile.currency,
                    socialLinks: profile.socialLinks,
                  }}
                  onSubmit={handleUpdateProfile}
                  onCancel={() => setIsEditing(false)}
                />
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-medium text-gray-500">Last Name</h3>
                      <p>{profile.lastName}</p>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-500">Display Name</h3>
                      <p>{profile.displayName || '-'}</p>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-500">Title</h3>
                      <p>{profile.title || '-'}</p>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-500">Gender</h3>
                      <p>{profile.gender?.replace('_', ' ') || '-'}</p>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-500">Secondary Email</h3>
                      <p>{profile.secondaryEmail || '-'}</p>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-500">Secondary Phone</h3>
                      <p>{profile.secondaryPhone || '-'}</p>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-500">WhatsApp</h3>
                      <p>{profile.whatsapp || '-'}</p>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-500">Experience</h3>
                      <p>{profile.experience ? `${profile.experience} years` : '-'}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-500">Bio</h3>
                    <p className="whitespace-pre-wrap">{profile.bio || '-'}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Add other tab contents for licenses, certifications, and languages */}
      </Tabs>
    </div>
  );
}
