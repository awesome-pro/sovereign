/* eslint-disable @typescript-eslint/no-unused-vars */
import { ApolloClient, InMemoryCache, createHttpLink, from, Observable } from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { setContext } from '@apollo/client/link/context';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import Cookies from 'js-cookie';
import { REFRESH_TOKEN_MUTATION } from '@/graphql/auth.mutations';

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
          const refreshToken = Cookies.get('refreshToken');

          if (!refreshToken) {
            handleLogout();
            return;
          }

          // Return a new observable to handle the refresh token flow
          return new Observable(observer => {
            // Function to retry the failed operation
            const retryOperation = async () => {
              try {
                const client = operation.getContext().client;
                const { data } = await client.mutate({
                  mutation: REFRESH_TOKEN_MUTATION,
                  variables: {
                    input: { refreshToken }
                  }
                });

                console.log(data);

                const { accessToken, refreshToken: newRefreshToken } = data;

                // Update tokens
                Cookies.set('accessToken', accessToken, {
                  secure: process.env.NODE_ENV === 'production',
                  sameSite: 'lax',
                  path: '/',
                });
                Cookies.set('refreshToken', newRefreshToken, {
                  secure: process.env.NODE_ENV === 'production',
                  sameSite: 'lax',
                  path: '/',
                  expires: 7,
                });

                // Retry the failed operation
                const subscriber = {
                  next: observer.next.bind(observer),
                  error: observer.error.bind(observer),
                  complete: observer.complete.bind(observer)
                };

                forward(operation).subscribe(subscriber);
                resolvePendingRequests();
              } catch (error) {
                handleLogout();
                observer.error(error);
              } finally {
                isRefreshing = false;
              }
            };

            if (isRefreshing) {
              // Queue the retry if we're already refreshing
              pendingRequests.push(retryOperation);
            } else {
              retryOperation();
            }
          });
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
  const token = Cookies.get('accessToken');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

function handleLogout() {
  Cookies.remove('accessToken', { path: '/' });
  Cookies.remove('refreshToken', { path: '/' });
  window.location.href = '/auth/sign-in';
}

// WebSocket link for subscriptions
let wsLink: GraphQLWsLink | null = null;
if (typeof window !== 'undefined') {
  wsLink = new GraphQLWsLink(
    createClient({
      url: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/graphql',
      connectionParams: () => ({
        token: Cookies.get('accessToken'),
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
