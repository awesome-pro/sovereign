import { gql } from "@apollo/client";

export const SEARCH_USERS_QUERY = gql`
    query SearchUsers($query: String!, $limit: Int) {
        searchUsers(query: $query, limit: $limit) {
            id
            name
            email
            avatar
        }
    }
`;