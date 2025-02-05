import { gql } from "@apollo/client";

export const SEARCH_PROPERTIES_QUERY = gql`
    query SearchProperties($query: String!, $limit: Int) {
        searchProperties(query: $query, limit: $limit) {
            id
            referenceNumber
            title
        }
    }
`;