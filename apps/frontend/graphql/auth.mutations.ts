import { gql } from '@apollo/client';

export const REGISTER_MUTATION = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      accessToken
      refreshToken
      user {
        id
        email
        status
        emailVerified
        phoneVerified
        twoFactorEnabled
        roles {
          id
          role {
            id
            name
            description
          }
          assignedAt
        }
      }
    }
  }
`;

export const LOGIN_MUTATION = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      accessToken
      refreshToken
      user {
        id
        email
        status
        emailVerified
        phoneVerified
        twoFactorEnabled
        roles {
          id
          role {
            id
            name
            description
          }
          assignedAt
        }
      }
    }
  }
`;

export const REFRESH_TOKEN_MUTATION = gql`
  mutation RefreshToken($input: RefreshTokenInput!) {
    refreshToken(input: $input) {
      accessToken
      refreshToken
    }
  }
`;

export const VERIFY_EMAIL_MUTATION = gql`
  mutation VerifyEmail($token: String!) {
    verifyEmail(token: $token) {
      success
      message
    }
  }
`;

export const REQUEST_PASSWORD_RESET_MUTATION = gql`
  mutation RequestPasswordReset($email: String!) {
    requestPasswordReset(email: $email) {
      success
      message
    }
  }
`;

export const RESET_PASSWORD_MUTATION = gql`
  mutation ResetPassword($input: ResetPasswordInput!) {
    resetPassword(input: $input) {
      success
      message
    }
  }
`;

export const SETUP_2FA_MUTATION = gql`
  mutation Setup2FA {
    setup2FA {
      secret
      qrCodeUrl
    }
  }
`;

export const VERIFY_2FA_MUTATION = gql`
  mutation Verify2FA($token: String!) {
    verify2FA(token: $token) {
      success
      message
    }
  }
`;

export const GET_CURRENT_USER_QUERY = gql`
  query GetCurrentUser {
    me {
      id
      email
      status
      emailVerified
      phoneVerified
      twoFactorEnabled
      roles {
        id
        role {
          id
          name
          description
        }
        assignedAt
      }
    }
  }
`;
