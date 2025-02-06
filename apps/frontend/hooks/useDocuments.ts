import { useQuery, useMutation } from '@apollo/client';
import { GET_DOCUMENTS, GET_DOCUMENT } from '../graphql/queries/documents';
import {
  CREATE_DOCUMENT,
  UPLOAD_FILE,
  UPDATE_DOCUMENT_STATUS,
  CREATE_DOCUMENT_ACCESS,
  CREATE_DOCUMENT_COMMENT,
  RESOLVE_DOCUMENT_COMMENT,
} from '../graphql/mutations/documents';
import { Document, DocumentFilters } from '../types/document';
import { DocumentFormat, DocumentSecurity, DocumentStatus } from '@/constants';

export const useDocuments = () => {
  // Queries
  const {
    data: documentsData,
    loading: documentsLoading,
    error: documentsError,  
    refetch: refetchDocuments,
  } = useQuery(GET_DOCUMENTS);

  // Mutations
  const [createDocument] = useMutation(CREATE_DOCUMENT);
  const [uploadFile] = useMutation(UPLOAD_FILE);
  const [updateDocumentStatus] = useMutation(UPDATE_DOCUMENT_STATUS);
  const [createDocumentAccess] = useMutation(CREATE_DOCUMENT_ACCESS);
  const [createDocumentComment] = useMutation(CREATE_DOCUMENT_COMMENT);
  const [resolveDocumentComment] = useMutation(RESOLVE_DOCUMENT_COMMENT);

  // Filter documents based on provided filters
  const filterDocuments = (documents: Document[], filters: DocumentFilters) => {
    if (!documents) return [];

    return documents.filter((doc) => {
      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        if (
          !doc.title.toLowerCase().includes(searchTerm) &&
          !doc.referenceNumber.toLowerCase().includes(searchTerm) &&
          !doc.description?.toLowerCase().includes(searchTerm)
        ) {
          return false;
        }
      }

      // Status filter
      if (filters.status?.length && !filters.status.includes(doc.status)) {
        return false;
      }

      // Type filter
      if (filters.type?.length && !filters.type.includes(doc.type)) {
        return false;
      }

      // Date range filter
      if (filters.dateRange) {
        const docDate = new Date(doc.createdAt);
        if (
          docDate < filters.dateRange.start ||
          docDate > filters.dateRange.end
        ) {
          return false;
        }
      }

      // Categories filter
      if (
        filters.categories?.length &&
        !doc.categories?.some((cat) => filters.categories?.includes(cat))
      ) {
        return false;
      }

      return true;
    });
  };

  // Handle document creation
  const handleCreateDocument = async (input: any) => {
    try {
      const { data } = await createDocument({
        variables: { input },
      });
      await refetchDocuments();
      return data.createDocument;
    } catch (error) {
      console.error('Error creating document:', error);
      throw error;
    }
  };

  // Handle file upload
  const handleFileUpload = async (input: any) => {
    try {
      const { data } = await uploadFile({
        variables: { input },
      });
      await refetchDocuments();
      return data.uploadFile;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  };

  // Handle status update
  const handleStatusUpdate = async (id: string, status: DocumentStatus) => {
    try {
      const { data } = await updateDocumentStatus({
        variables: { id, status },
      });
      await refetchDocuments();
      return data.updateDocumentStatus;
    } catch (error) {
      console.error('Error updating document status:', error);
      throw error;
    }
  };

  return {
    documents: documentsData?.documents || [],
    loading: documentsLoading,
    error: documentsError,
    filterDocuments,
    createDocument: handleCreateDocument,
    uploadFile: handleFileUpload,
    updateDocumentStatus: handleStatusUpdate,
    createDocumentAccess,
    createDocumentComment,
    resolveDocumentComment,
    refetchDocuments,
  };
};
