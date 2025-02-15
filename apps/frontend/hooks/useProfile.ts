import { useQuery, useMutation } from '@apollo/client';
import { GET_USER_PROFILE } from '@/graphql/profile.queries';
import {
  UPDATE_PROFILE,
  UPLOAD_AVATAR,
  UPLOAD_COVER_IMAGE,
  UPDATE_ADDRESS,
  ADD_LICENSE,
  UPDATE_LICENSE,
  DELETE_LICENSE,
  ADD_CERTIFICATION,
  UPDATE_CERTIFICATION,
  DELETE_CERTIFICATION,
  UPDATE_LANGUAGES,
} from '@/graphql/profile.mutations';
import type {
  UserProfile,
  UpdateProfileInput,
  AddressInput,
  LicenseInput,
  CertificationInput,
  LanguageInput,
} from '@/types/profile';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { getApolloClient } from '@/lib/apollo-client'; // Import the Apollo client

export const useProfile = () => {
  // State for upload loading
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [coverImageUploading, setCoverImageUploading] = useState(false);


  // Queries
  const {
    data: profileData,
    loading: profileLoading,
    error: profileError,
    refetch: refetchProfile,
  } = useQuery(GET_USER_PROFILE, {
    fetchPolicy: 'cache-first',
    nextFetchPolicy: 'cache-only',
    notifyOnNetworkStatusChange: true,
    // onCompleted: (data) => {
    //   // Update cache with normalized data
    //   getApolloClient()?.cache.writeQuery({
    //     query: GET_USER_PROFILE,
    //     data: {
    //       getProfile: {
    //         ...data.getProfile,
    //         __typename: 'UserProfile',
    //       },
    //     },
    //   });
    // },
  });

  // Mutations
  const [updateProfile] = useMutation(UPDATE_PROFILE, {
    update(cache, { data: { updateProfile: updatedProfile } }) {
      cache.modify({
        fields: {
          getProfile(existingProfile) {
            if (existingProfile) {
              return {
                ...existingProfile,
                ...updatedProfile,
              };
            }
            return updatedProfile;
          }
        }
      });
    },
    onCompleted: () => {
      toast.success('Profile updated successfully');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const [uploadAvatar] = useMutation(UPLOAD_AVATAR, {
    update(cache, { data: { uploadAvatar: avatarUrl } }) {
      cache.modify({
        fields: {
          getProfile(existingProfile) {
            if (existingProfile) {
              return {
                ...existingProfile,
                user: {
                  ...existingProfile.user,
                  avatar: avatarUrl,
                },
              };
            }
            return existingProfile;
          }
        }
      });
    },
    onCompleted: () => {
      toast.success('Avatar uploaded successfully');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const [uploadCoverImage] = useMutation(UPLOAD_COVER_IMAGE, {
    update(cache, { data: { uploadCoverImage: coverImageUrl } }) {
      cache.modify({
        fields: {
          getProfile(existingProfile) {
            if (existingProfile) {
              return {
                ...existingProfile,
                coverImage: coverImageUrl,
              };
            }
            return existingProfile;
          }
        }
      });
    },
    onCompleted: () => {
      toast.success('Cover image uploaded successfully');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const [updateAddress] = useMutation(UPDATE_ADDRESS, {
    onCompleted: () => {
      toast.success('Address updated successfully');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const [addLicense] = useMutation(ADD_LICENSE, {
    onCompleted: () => {
      toast.success('License added successfully');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const [updateLicense] = useMutation(UPDATE_LICENSE, {
    onCompleted: () => {
      toast.success('License updated successfully');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const [deleteLicense] = useMutation(DELETE_LICENSE, {
    onCompleted: () => {
      toast.success('License deleted successfully');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const [addCertification] = useMutation(ADD_CERTIFICATION, {
    onCompleted: () => {
      toast.success('Certification added successfully');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const [updateCertification] = useMutation(UPDATE_CERTIFICATION, {
    onCompleted: () => {
      toast.success('Certification updated successfully');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const [deleteCertification] = useMutation(DELETE_CERTIFICATION, {
    onCompleted: () => {
      toast.success('Certification deleted successfully');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const [updateLanguages] = useMutation(UPDATE_LANGUAGES, {
    onCompleted: () => {
      toast.success('Languages updated successfully');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Helper functions with robust error handling
  const handleUpdateProfile = useCallback(async (input: UpdateProfileInput) => {
    try {
      await updateProfile({ variables: { input } });
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  }, [updateProfile]);

  const handleUploadAvatar = useCallback(async (file: File) => {
    // Validate file
    if (!file) {
      toast.error('No file selected');
      return;
    }

    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      toast.error('File size must be less than 5MB');
      return;
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type. Please upload a JPEG, PNG, GIF, or WebP image.');
      return;
    }

    try {
      setAvatarUploading(true);
      await uploadAvatar({ 
        variables: { 
          file: file // Pass the file directly
        },
        context: {
          headers: {
            'apollo-require-preflight': 'true',
          }
        }
      });
    } catch (error) {
      console.error('Failed to upload avatar:', error);
      toast.error('Failed to upload avatar. Please try again.');
    } finally {
      setAvatarUploading(false);
    }
  }, [uploadAvatar]);

  const handleUploadCoverImage = useCallback(async (file: File) => {
    // Validate file
    if (!file) {
      toast.error('No file selected');
      return;
    }

    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      toast.error('File size must be less than 5MB');
      return;
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type. Please upload a JPEG, PNG, GIF, or WebP image.');
      return;
    }

    try {
      setCoverImageUploading(true);
      
      // Use a FormData object to ensure proper file upload
      const formData = new FormData();
      formData.append('file', file, file.name);

      await uploadCoverImage({ 
        variables: { 
          file: file // Pass the file directly
        },
        context: {
          headers: {
            'apollo-require-preflight': 'true',
            'Content-Type': 'multipart/form-data',
          }
        }
      });
    } catch (error) {
      console.error('Failed to upload cover image:', error);
      toast.error('Failed to upload cover image. Please try again.');
    } finally {
      setCoverImageUploading(false);
    }
  }, [uploadCoverImage]);

  const handleUpdateAddress = useCallback(async (input: AddressInput) => {
    try {
      await updateAddress({ variables: { input } });
    } catch (error) {
      console.error('Failed to update address:', error);
    }
  }, [updateAddress]);

  const handleAddLicense = useCallback(async (input: LicenseInput) => {
    try {
      await addLicense({ variables: { input } });
    } catch (error) {
      console.error('Failed to add license:', error);
    }
  }, [addLicense]);

  const handleUpdateLicense = useCallback(async (licenseId: string, input: LicenseInput) => {
    try {
      await updateLicense({ variables: { licenseId, input } });
    } catch (error) {
      console.error('Failed to update license:', error);
    }
  }, [updateLicense]);

  const handleDeleteLicense = useCallback(async (licenseId: string) => {
    try {
      await deleteLicense({ variables: { licenseId } });
    } catch (error) {
      console.error('Failed to delete license:', error);
    }
  }, [deleteLicense]);

  const handleAddCertification = useCallback(async (input: CertificationInput) => {
    try {
      await addCertification({ variables: { input } });
    } catch (error) {
      console.error('Failed to add certification:', error);
    }
  }, [addCertification]);

  const handleUpdateCertification = useCallback(async (certId: string, input: CertificationInput) => {
    try {
      await updateCertification({ variables: { certId, input } });
    } catch (error) {
      console.error('Failed to update certification:', error);
    }
  }, [updateCertification]);

  const handleDeleteCertification = useCallback(async (certId: string) => {
    try {
      await deleteCertification({ variables: { certId } });
    } catch (error) {
      console.error('Failed to delete certification:', error);
    }
  }, [deleteCertification]);

  const handleUpdateLanguages = useCallback(async (languages: LanguageInput[]) => {
    try {
      await updateLanguages({ variables: { languages } });
    } catch (error) {
      console.error('Failed to update languages:', error);
    }
  }, [updateLanguages]);

  return {
    profile: profileData?.getProfile as UserProfile,
    loading: profileLoading,
    error: profileError,
    refetch: refetchProfile,
    updateProfile: handleUpdateProfile,
    uploadAvatar: handleUploadAvatar,
    uploadCoverImage: handleUploadCoverImage,
    updateAddress: handleUpdateAddress,
    addLicense: handleAddLicense,
    updateLicense: handleUpdateLicense,
    deleteLicense: handleDeleteLicense,
    addCertification: handleAddCertification,
    updateCertification: handleUpdateCertification,
    deleteCertification: handleDeleteCertification,
    updateLanguages: handleUpdateLanguages,
    avatarUploading,
    coverImageUploading,
  };
};
