import { gql } from "@apollo/client";

export const SEARCH_LEADS_QUERY = gql`
  query SearchLeads($query: String!, $limit: Int) {
    searchLeads(query: $query, limit: $limit) {
      id
      referenceNumber
      title
    }
  }
`;