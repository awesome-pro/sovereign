/* eslint-disable @typescript-eslint/no-unused-vars */
import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { setContext } from '@apollo/client/link/context';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';

const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:8000/graphql',
  credentials: 'include',
});

// Error handling link
const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  if (graphQLErrors) {
    for (const err of graphQLErrors) {
      if (err.extensions?.code === 'UNAUTHENTICATED') {
        // Trigger token refresh logic here
        return forward(operation);
      }
    }
  }
  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
  }
});

// Auth link for adding tokens to requests
const authLink = setContext((_, { headers }) => {
  const accessToken = sessionStorage.getItem('accessToken');
  return {
    headers: {
      ...headers,
      authorization: accessToken ? `Bearer ${accessToken}` : '',
    },
  };
});

// WebSocket link for subscriptions (if needed)
let wsLink: GraphQLWsLink | null = null;
if (typeof window !== 'undefined') {
  wsLink = new GraphQLWsLink(
    createClient({
      url: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/graphql',
      connectionParams: () => ({
        token: sessionStorage.getItem('accessToken'),
      }),
    })
  );
}

export function createApolloClient() {
  return new ApolloClient({
    link: from([errorLink, authLink, httpLink]),
    cache: new InMemoryCache(),
    defaultOptions: {
      watchQuery: {
        fetchPolicy: 'cache-and-network',
      },
    },
  });
}
