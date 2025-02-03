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
import { useCallback } from 'react';
import { toast } from 'sonner';

export const useProfile = () => {
  // Queries
  const {
    data: profileData,
    loading: profileLoading,
    error: profileError,
    refetch: refetchProfile,
  } = useQuery(GET_USER_PROFILE, {
    fetchPolicy: 'cache-and-network',
  });

  // Mutations
  const [updateProfile] = useMutation(UPDATE_PROFILE, {
    onCompleted: () => {
      toast.success('Profile updated successfully');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const [uploadAvatar] = useMutation(UPLOAD_AVATAR, {
    onCompleted: () => {
      toast.success('Avatar uploaded successfully');
      refetchProfile();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const [uploadCoverImage] = useMutation(UPLOAD_COVER_IMAGE, {
    onCompleted: () => {
      toast.success('Cover image uploaded successfully');
      refetchProfile();
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

  // Helper functions
  const handleUpdateProfile = useCallback(async (input: UpdateProfileInput) => {
    try {
      await updateProfile({ variables: { input } });
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  }, [updateProfile]);

  const handleUploadAvatar = useCallback(async (file: File) => {
    try {
      await uploadAvatar({ variables: { file } });
    } catch (error) {
      console.error('Failed to upload avatar:', error);
    }
  }, [uploadAvatar]);

  const handleUploadCoverImage = useCallback(async (file: File) => {
    try {
      await uploadCoverImage({ variables: { file } });
    } catch (error) {
      console.error('Failed to upload cover image:', error);
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
  };
};
