"use client";

import React from 'react';
import { Metadata } from 'next';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { BasicInfoForm } from '@/components/profile/BasicInfoForm';
import { useProfile } from '@/hooks/useProfile';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { RefreshCcw } from 'lucide-react';
import { Gender, UpdateProfileInput, parseSocialLinks } from '@/types/profile';
import Link from 'next/link';
import { 
  LinkedinIcon, 
  TwitterIcon, 
  FacebookIcon, 
  InstagramIcon, 
  GlobeIcon 
} from 'lucide-react';

export default function ProfilePage() {
  const {
    profile,
    loading,
    error,
    updateProfile,
    refetch,
  } = useProfile();

  const [isEditing, setIsEditing] = React.useState(false);
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const handleUpdateProfile = async (data: UpdateProfileInput) => {
    await updateProfile(data);
    setIsEditing(false);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } catch (err) {
      console.error('Failed to refresh profile', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  if (loading && !profile) {
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
      <div className="text-center py-8 space-y-4">
        <p className="text-red-500">Error loading profile: {error.message}</p>
        <Button onClick={handleRefresh} disabled={isRefreshing}>
          {isRefreshing ? 'Refreshing...' : 'Try Again'}
        </Button>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-8 space-y-4">
        <p>Profile not found</p>
        <Button onClick={handleRefresh} disabled={isRefreshing}>
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto py-8 w-full">
      <div className="flex justify-end mb-4">
        <Button 
          variant="outline" 
          onClick={handleRefresh} 
          disabled={isRefreshing}
          className="flex items-center"
        >
          <RefreshCcw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Refreshing...' : 'Refresh Profile'}
        </Button>
      </div>

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
                    lastName: profile.lastName || '',
                    displayName: profile.displayName || '',
                    bio: profile.bio || '',
                    title: profile.title || '',
                    gender: profile.gender || Gender.MALE,
                    nationality: profile.nationality || '',
                    secondaryEmail: profile.secondaryEmail || '',
                    secondaryPhone: profile.secondaryPhone || '',
                    whatsapp: profile.whatsapp || '',
                    experience: profile.experience || 0,
                    timeZone: profile.timeZone || '',
                    currency: profile.currency || '',
                    socialLinks: profile.socialLinks ,
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
                  {profile.socialLinks && (
                    <div className="mt-6">
                      <h3 className="font-medium text-gray-500 mb-4">Social Links</h3>
                      <div className="flex space-x-4">
                        {(() => {
                          const socialLinks = parseSocialLinks(profile.socialLinks);
                          
                          return (
                            <>
                              {socialLinks?.linkedin && (
                                <Link 
                                  href={socialLinks.linkedin} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800"
                                >
                                  <LinkedinIcon className="w-6 h-6" />
                                </Link>
                              )}
                              {socialLinks?.twitter && (
                                <Link 
                                  href={socialLinks.twitter} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-400 hover:text-blue-600"
                                >
                                  <TwitterIcon className="w-6 h-6" />
                                </Link>
                              )}
                              {socialLinks?.facebook && (
                                <Link 
                                  href={socialLinks.facebook} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-700 hover:text-blue-900"
                                >
                                  <FacebookIcon className="w-6 h-6" />
                                </Link>
                              )}
                              {socialLinks?.instagram && (
                                <Link 
                                  href={socialLinks.instagram} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-pink-600 hover:text-pink-800"
                                >
                                  <InstagramIcon className="w-6 h-6" />
                                </Link>
                              )}
                              {socialLinks?.website && (
                                <Link 
                                  href={socialLinks.website} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-gray-600 hover:text-gray-800"
                                >
                                  <GlobeIcon className="w-6 h-6" />
                                </Link>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  )}
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
