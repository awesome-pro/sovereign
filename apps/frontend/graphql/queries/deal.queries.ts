import { gql } from "@apollo/client";

export const SEARCH_DEALS_QUERY = gql`
    query SearchDeals($query: String!, $limit: Int) {
        searchDeals(query: $query, limit: $limit) {
            id
            referenceNumber
            title
        }
    }
`;