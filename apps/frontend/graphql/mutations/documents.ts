import { gql } from '@apollo/client';

export const CREATE_DOCUMENT = gql`
  mutation CreateDocument($input: CreateDocumentInput!) {
    createDocument(input: $input) {
      id
      referenceNumber
      title
      type
      status
      security
      description
      language
      createdAt
    }
  }
`;

export const UPLOAD_FILE = gql`
  mutation UploadFile($input: UploadFileInput!) {
    uploadFile(input: $input) {
      id
      fileName
      fileSize
      fileType
      url
      documentId
    }
  }
`;

export const UPDATE_DOCUMENT_STATUS = gql`
  mutation UpdateDocumentStatus($id: ID!, $status: DocumentStatus!) {
    updateDocumentStatus(id: $id, status: $status) {
      id
      status
    }
  }
`;

export const CREATE_DOCUMENT_ACCESS = gql`
  mutation CreateDocumentAccess($input: CreateDocumentAccessInput!) {
    createDocumentAccess(input: $input) {
      id
      documentId
      userId
      teamId
      canView
      canEdit
      canDelete
      canShare
      validFrom
      validUntil
    }
  }
`;

export const CREATE_DOCUMENT_COMMENT = gql`
  mutation CreateDocumentComment($input: CreateDocumentCommentInput!) {
    createDocumentComment(input: $input) {
      id
      content
      documentId
      user {
        id
        name
        avatar
      }
      createdAt
    }
  }
`;

export const RESOLVE_DOCUMENT_COMMENT = gql`
  mutation ResolveDocumentComment($id: ID!) {
    resolveDocumentComment(id: $id) {
      id
      resolved
      resolvedAt
    }
  }
`;
