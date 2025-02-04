"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { BasicInfoForm } from '@/components/profile/BasicInfoForm';
import { useProfile } from '@/hooks/useProfile';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { RefreshCcw, Edit, X } from 'lucide-react';
import { Gender, UpdateProfileInput, parseSocialLinks } from '@/types/profile';
import { cn } from '@/lib/utils';

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
      <div className="container mx-auto px-4 py-8 space-y-8">
        <Skeleton className="h-64 w-full rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="container mx-auto px-4 py-8 text-center"
      >
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 max-w-md mx-auto">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Profile Error</h2>
          <p className="text-red-500 mb-6">{error.message}</p>
          <Button 
            onClick={handleRefresh} 
            disabled={isRefreshing}
            variant="destructive"
            className="mx-auto"
          >
            <RefreshCcw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Try Again'}
          </Button>
        </div>
      </motion.div>
    );
  }

  if (!profile) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="container mx-auto px-4 py-8 text-center"
      >
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 max-w-md mx-auto">
          <h2 className="text-2xl font-bold text-gray-600 mb-4">Profile Not Found</h2>
          <p className="text-gray-500 mb-6">Unable to retrieve your profile information.</p>
          <Button 
            onClick={handleRefresh} 
            disabled={isRefreshing}
            className="mx-auto"
          >
            <RefreshCcw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="container mx-auto px-4"
    >
      <div className="flex justify-end mb-1">
        <Button 
          variant="outline" 
          onClick={handleRefresh} 
          disabled={isRefreshing}
          className="absolute right-6 top-4 z-20"
        >
          <RefreshCcw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Refreshing...' : 'Refresh Profile'}
        </Button>
      </div>
      <ProfileHeader
        profile={profile}
        onEditBasicInfo={() => setIsEditing(true)}
      />

      <AnimatePresence>
        <Tabs defaultValue="basic-info" className="mt-8">
          <TabsList className="grid grid-cols-4 w-full mb-6 bg-gray-100">
            <TabsTrigger 
              value="basic-info" 
              className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-l-xl"
            >
              Basic Info
            </TabsTrigger>
            <TabsTrigger 
              value="licenses" 
              className="data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              Licenses
            </TabsTrigger>
            <TabsTrigger 
              value="certifications" 
              className="data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              Certifications
            </TabsTrigger>
            <TabsTrigger 
              value="languages" 
              className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-r-xl"
            >
              Languages
            </TabsTrigger>
          </TabsList>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <TabsContent value="basic-info">
              <Card className="p-0 border-none shadow-lg">
                {isEditing ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex justify-between items-center p-6 pb-0 border-b">
                      <h2 className="text-2xl font-bold text-gray-800">Edit Profile</h2>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="icon" 
                          onClick={() => setIsEditing(false)}
                        >
                          <X className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
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
                        socialLinks: profile.socialLinks,
                      }}
                      onSubmit={handleUpdateProfile}
                      onCancel={() => setIsEditing(false)}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="p-6"
                  >
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
                                  <a 
                                    href={socialLinks.linkedin} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800"
                                  >
                                    <i className="w-6 h-6 lucide-linkedin" />
                                  </a>
                                )}
                                {socialLinks?.twitter && (
                                  <a 
                                    href={socialLinks.twitter} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-blue-400 hover:text-blue-600"
                                  >
                                    <i className="w-6 h-6 lucide-twitter" />
                                  </a>
                                )}
                                {socialLinks?.facebook && (
                                  <a 
                                    href={socialLinks.facebook} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-blue-700 hover:text-blue-900"
                                  >
                                    <i className="w-6 h-6 lucide-facebook" />
                                  </a>
                                )}
                                {socialLinks?.instagram && (
                                  <a 
                                    href={socialLinks.instagram} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-pink-600 hover:text-pink-800"
                                  >
                                    <i className="w-6 h-6 lucide-instagram" />
                                  </a>
                                )}
                                {socialLinks?.website && (
                                  <a 
                                    href={socialLinks.website} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-gray-600 hover:text-gray-800"
                                  >
                                    <i className="w-6 h-6 lucide-globe" />
                                  </a>
                                )}
                              </>
                            );
                          })()}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </Card>
            </TabsContent>
          </motion.div>
        </Tabs>
      </AnimatePresence>
    </motion.div>
  );
}
