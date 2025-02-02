import { ApolloClient, InMemoryCache, createHttpLink, from, Observable, NormalizedCacheObject, Reference, ApolloLink } from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { toast } from 'sonner';
import { GET_CURRENT_USER_QUERY } from '@/graphql/auth.mutations';

let apolloClient: ApolloClient<NormalizedCacheObject> | null = null;

// Create a class to manage token refresh state with better request queue handling
class TokenRefreshManager {
  private isRefreshing = false;
  private pendingRequests: Array<{
    resolve: (value: any) => void;
    reject: (reason?: any) => void;
  }> = [];

  async handleTokenRefresh() {
    if (this.isRefreshing) {
      return new Promise((resolve, reject) => {
        this.pendingRequests.push({ resolve, reject });
      });
    }

    this.isRefreshing = true;

    try {
      const clientFingerprint = typeof window !== 'undefined' ? localStorage.getItem('dfp') : null;
      const response = await fetch('/api/auth/session', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'X-Client-Fingerprint': clientFingerprint || '',
          'User-Agent': typeof window !== 'undefined' ? window.navigator.userAgent : '',
        },
      });

      const session = await response.json();

      if (response.ok && session?.user) {
        this.pendingRequests.forEach(({ resolve }) => resolve(session.user));
        return session.user;
      }

      this.pendingRequests.forEach(({ reject }) => 
        reject(new Error('Session refresh failed'))
      );
      return null;
    } catch (error) {
      this.pendingRequests.forEach(({ reject }) => reject(error));
      console.error('Token refresh failed:', error);
      return false;
    } finally {
      this.isRefreshing = false;
      this.pendingRequests = [];
    }
  }
}

const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        me: {
          keyArgs: false,
          read(existing) {
            if (!existing) return undefined;
            const now = Date.now();
            if (now - existing.__timestamp > 5 * 60 * 1000) {
              return undefined;
            }
            return existing;
          },
          merge(_, incoming) {
            return {
              ...incoming,
              __typename: 'User',
              __timestamp: Date.now(),
            };
          },
        },
        tasks: {
          keyArgs: ['filter'],
          merge(existing = [], incoming, { args }) {
            if (args?.offset === 0) {
              return incoming;
            }
            return [...existing, ...incoming];
          }
        }
      }
    },
    User: {
      keyFields: ['id'],
      fields: {
        roles: {
          merge(existing = [], incoming) {
            return incoming;
          }
        },
        permissions: {
          merge(existing = [], incoming) {
            return incoming;
          }
        }
      }
    },
    Task: {
      keyFields: ['id'],
      fields: {
        checklist: {
          merge(existing = [], incoming) {
            return incoming;
          }
        },
        comments: {
          merge(existing = [], incoming, { readField }) {
            const merged = existing ? [...existing] : [];
            incoming.forEach((comment: any) => {
              const index = merged.findIndex(
                (item: any) => readField('id', item) === readField('id', comment)
              );
              if (index >= 0) {
                merged[index] = comment;
              } else {
                merged.push(comment);
              }
            });
            return merged;
          }
        }
      }
    }
  }
});

export function getApolloClient() {
  // Only create client in browser environment
  if (typeof window === 'undefined') return null;
  
  try {
    if (!apolloClient) {
      const tokenManager = new TokenRefreshManager();

      // Validate GraphQL URL
      const graphqlUrl = process.env.NEXT_PUBLIC_GRAPHQL_URL;
      if (!graphqlUrl) {
        console.error('GraphQL URL is not configured');
        return null;
      }

      const httpLink = createHttpLink({
        uri: graphqlUrl,
        credentials: 'include',
      });

      const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
        if (graphQLErrors) {
          for (const err of graphQLErrors) {
            switch (err.extensions?.code) {
              case 'UNAUTHENTICATED':
                return new Observable(observer => {
                  tokenManager.handleTokenRefresh()
                    .then(user => {
                      if (user) {
                        // Update cache with new user data
                        cache.writeQuery({
                          query: GET_CURRENT_USER_QUERY,
                          data: { me: { ...user, __typename: 'User', __timestamp: Date.now() } },
                        });
                        // Retry the failed request
                        const subscriber = forward(operation);
                        subscriber.subscribe(observer);
                      } else {
                        window.location.href = '/auth/sign-in?reason=session_expired';
                      }
                    })
                    .catch(() => {
                      window.location.href = '/auth/sign-in?reason=refresh_failed';
                    });
                });
              case 'FORBIDDEN':
                window.location.href = '/auth/unauthorized';
                break;
              case 'SECURITY_LEVEL_INSUFFICIENT':
                window.location.href = '/auth/mfa';
                break;
              default:
                console.error('GraphQL Error:', err);
                toast.error(err.message || 'An error occurred');
                //window.location.href = '/auth/sign-in?reason=graphql_error';
            }
          }
        }

        if (networkError) {
          console.error('Network error:', networkError);
          toast.error('Network error occurred. Please check your connection and try again.');
        }
      });

      apolloClient = new ApolloClient({
        link: from([errorLink, httpLink]),
        cache,
        defaultOptions: {
          watchQuery: {
            fetchPolicy: 'cache-and-network',
            nextFetchPolicy: 'cache-first',
            errorPolicy: 'all',
          },
          query: {
            fetchPolicy: 'cache-first',
            errorPolicy: 'all',
          },
          mutate: {
            fetchPolicy: 'no-cache',
            errorPolicy: 'all',
          },
        },
        connectToDevTools: process.env.NODE_ENV === 'development',
      });

      // Initialize client with user data
      apolloClient.query({
        query: GET_CURRENT_USER_QUERY,
        fetchPolicy: 'network-only'
      }).catch(error => {
        console.error('Failed to fetch initial user data:', error);
        // Don't throw error here, let the app continue
      });
    }

    return apolloClient;
  } catch (error) {
    console.error('Failed to initialize Apollo Client:', error);
    return null;
  }
}

export function resetApolloClient() {
  apolloClient = null;
}