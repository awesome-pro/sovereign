import { gql } from '@apollo/client';

export const GET_DOCUMENTS = gql`
  query GetDocuments {
    documents {
      id
      referenceNumber
      title
      type
      status
      security
      description
      language
      createdAt
      updatedAt
      files {
        id
        fileName
        url
        fileSize
        fileType
      }
      createdBy {
        id
        email
        name
        avatar
      }
    }
  }
`;

export const GET_DOCUMENT = gql`
  query GetDocument($id: ID!) {
    document(id: $id) {
      id
      referenceNumber
      title
      type
      status
      security
      description
      language
      version
      files {
        id
        fileName
        url
        fileSize
        fileType
      }
      categories
      customAttributes
      accesses {
        id
        userId
        teamId
        canView
        canEdit
        canDelete
        canShare
        validFrom
        validUntil
        grantedAt
      }
      comments {
        id
        content
        resolved
        resolvedAt
        user {
          id
          name
          avatar
        }
        replies {
          id
          content
          user {
            id
            name
            avatar
          }
        }
      }
      activities {
        id
        activityType
        description
        createdAt
        user {
          id
          name
          avatar
        }
      }
      createdBy {
        id
        name
        avatar
      }
      createdAt
      updatedAt
    }
  }
`;
