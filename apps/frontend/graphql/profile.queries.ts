import { gql } from '@apollo/client';

export const GET_USER_PROFILE = gql`
  query GetUserProfile {
    getProfile {
      id
      userId
      lastName
      displayName
      bio
      coverImage
      dateOfBirth
      gender
      nationality
      secondaryEmail
      secondaryPhone
      whatsapp
      address {
        id
        street
        city
        state
        country
        postalCode
        isVerified
      }
      title
      specializations
      licenses {
        id
        type
        number
        issuingAuthority
        issueDate
        expiryDate
        isVerified
      }
      certifications {
        id
        name
        issuingOrganization
        issueDate
        expiryDate
        isVerified
      }
      experience
      activeListings
      rating
      reviewCount
      languages {
        id
        code
        name
        proficiency
      }
      timeZone
      currency
      socialLinks {
        linkedin
        twitter
        facebook
        instagram
        website
      }
      createdAt
      updatedAt
    }
  }
`;
