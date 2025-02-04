import { gql } from '@apollo/client';

export const UPDATE_PROFILE = gql`
  mutation UpdateProfile($input: UpdateProfileInput!) {
    updateProfile(input: $input) {
      id
      lastName
      displayName
      bio
      dateOfBirth
      gender
      nationality
      secondaryEmail
      secondaryPhone
      whatsapp
      title
      specializations
      experience
      timeZone
      currency
      socialLinks {
        linkedin
        twitter
        facebook
        instagram
        website
      }
    }
  }
`;

export const UPLOAD_AVATAR = gql`
  mutation UploadAvatar($file: Upload!) {
    uploadAvatar(file: $file)
  }
`;

export const UPLOAD_COVER_IMAGE = gql`
  mutation UploadCoverImage($file: Upload!) {
    uploadCoverImage(file: $file)
  }
`;

export const UPDATE_ADDRESS = gql`
  mutation UpdateAddress($input: AddressInput!) {
    updateAddress(input: $input) {
      id
      address {
        id
        street
        city
        state
        country
        postalCode
        isVerified
      }
    }
  }
`;

export const ADD_LICENSE = gql`
  mutation AddLicense($input: LicenseInput!) {
    addLicense(input: $input) {
      id
      licenses {
        id
        type
        number
        issuingAuthority
        issueDate
        expiryDate
        isVerified
      }
    }
  }
`;

export const UPDATE_LICENSE = gql`
  mutation UpdateLicense($licenseId: ID!, $input: LicenseInput!) {
    updateLicense(licenseId: $licenseId, input: $input) {
      id
      licenses {
        id
        type
        number
        issuingAuthority
        issueDate
        expiryDate
        isVerified
      }
    }
  }
`;

export const DELETE_LICENSE = gql`
  mutation DeleteLicense($licenseId: ID!) {
    deleteLicense(licenseId: $licenseId) {
      id
      licenses {
        id
      }
    }
  }
`;

export const ADD_CERTIFICATION = gql`
  mutation AddCertification($input: CertificationInput!) {
    addCertification(input: $input) {
      id
      certifications {
        id
        name
        issuingOrganization
        issueDate
        expiryDate
        isVerified
      }
    }
  }
`;

export const UPDATE_CERTIFICATION = gql`
  mutation UpdateCertification($certId: ID!, $input: CertificationInput!) {
    updateCertification(certId: $certId, input: $input) {
      id
      certifications {
        id
        name
        issuingOrganization
        issueDate
        expiryDate
        isVerified
      }
    }
  }
`;

export const DELETE_CERTIFICATION = gql`
  mutation DeleteCertification($certId: ID!) {
    deleteCertification(certId: $certId) {
      id
      certifications {
        id
      }
    }
  }
`;

export const UPDATE_LANGUAGES = gql`
  mutation UpdateLanguages($languages: [LanguageInput!]!) {
    updateLanguages(languages: $languages) {
      id
      languages {
        id
        code
        name
        proficiency
      }
    }
  }
`;
