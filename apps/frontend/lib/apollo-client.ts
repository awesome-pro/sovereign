/* eslint-disable @typescript-eslint/no-unused-vars */
import { ApolloClient, InMemoryCache, createHttpLink, from, Observable } from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { setContext } from '@apollo/client/link/context';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import Cookies from 'js-cookie';
import { AUTH_TOKEN_KEY, REFRESH_TOKEN_KEY } from '@/config/auth.config';

const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:8000/graphql',
  credentials: 'include',
});

let isRefreshing = false;
let pendingRequests: Function[] = [];

// Function to process pending requests
const resolvePendingRequests = () => {
  pendingRequests.forEach((callback) => callback());
  pendingRequests = [];
};

// Error handling link with token refresh logic
const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  if (graphQLErrors) {
    for (const err of graphQLErrors) {
      if (err.extensions?.code === 'UNAUTHENTICATED') {
        if (!isRefreshing) {
          isRefreshing = true;

          // Instead of handling refresh directly, redirect to refresh endpoint
          if (typeof window !== 'undefined') {
            const currentPath = window.location.pathname;
            window.location.href = `/api/auth/refresh?redirect=${encodeURIComponent(currentPath)}`;
            return;
          }
        }

        // Queue the operation if we're already refreshing
        return new Observable(observer => {
          pendingRequests.push(() => {
            forward(operation).subscribe(observer);
          });
        });
      }
    }
  }

  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
    handleLogout();
  }
});

// Auth link for adding tokens to requests
const authLink = setContext((_, { headers }) => {
  const token = Cookies.get(AUTH_TOKEN_KEY);
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

function handleLogout() {
  Cookies.remove(AUTH_TOKEN_KEY, { path: '/' });
  Cookies.remove(REFRESH_TOKEN_KEY, { path: '/' });
  window.location.href = '/auth/sign-in';
}

// WebSocket link for subscriptions
let wsLink: GraphQLWsLink | null = null;
if (typeof window !== 'undefined') {
  wsLink = new GraphQLWsLink(
    createClient({
      url: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/graphql',
      connectionParams: () => ({
        token: Cookies.get(AUTH_TOKEN_KEY),
      }),
    })
  );
}

export function createApolloClient() {
  const client = new ApolloClient({
    link: from([errorLink, authLink, httpLink]),
    cache: new InMemoryCache({
      typePolicies: {
        Query: {
          fields: {
            me: {
              merge: true,
            },
          },
        },
      },
    }),
    defaultOptions: {
      watchQuery: {
        fetchPolicy: 'cache-and-network',
        nextFetchPolicy: 'cache-first',
      },
      query: {
        fetchPolicy: 'network-only',
        errorPolicy: 'all',
      },
      mutate: {
        errorPolicy: 'all',
      },
    },
  });

  return client;
}
