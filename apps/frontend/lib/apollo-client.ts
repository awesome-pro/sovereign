import { 
  ApolloClient, 
  InMemoryCache, 
  from, 
  Observable, 
  NormalizedCacheObject, 
  Reference, 
  ApolloLink, 
  StoreObject 
} from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { setContext } from '@apollo/client/link/context';
import createUploadLink from 'apollo-upload-client/createUploadLink.mjs';
import { toast } from 'sonner';
import { GET_CURRENT_USER_QUERY } from '@/graphql/auth.mutations';
import { KeyFieldsFunction } from '@apollo/client/cache/inmemory/policies';

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
        credentials: 'include', // Important for HTTP-only cookies
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

// Create a custom cache with advanced merge strategies
const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        me: {
          keyArgs: false,
          read(existing) {
            if (!existing) return undefined;
            const now = Date.now();
            // Invalidate cache after 5 minutes
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
        getProfile: {
          merge(existing, incoming, { mergeObjects }) {
            return incoming ? mergeObjects(existing, incoming) : incoming;
          },
          read(existing) {
            return existing;
          }
        },
        tasks: {
          keyArgs: ['filter'],
          merge(existing = [], incoming, { args, readField }) {
            // If it's a new query (no offset) or no existing data, return incoming
            if (!existing || !existing.length) {
              return incoming;
            }

            // Create a map of existing tasks by ID to avoid duplicates
            const existingTasksMap = new Map();
            existing.forEach((task: Reference | StoreObject | undefined) => {
              const id = readField('id', task);
              if (id) {
                existingTasksMap.set(id, task);
              }
            });

            // Update or add new tasks
            incoming.forEach((task: Reference | StoreObject | undefined) => {
              const id = readField('id', task);
              if (id) {
                existingTasksMap.set(id, task);
              }
            });

            return Array.from(existingTasksMap.values());
          }
        }
      }
    },
    User: {
      keyFields: ['id'],
      fields: {
        roles: { merge: (_, incoming) => incoming },
        permissions: { merge: (_, incoming) => incoming }
      }
    }
  },
  dataIdFromObject: ((object: any) => {
    if (object.__typename === 'User' && object.id) return `User:${object.id}`;
    if (object.__typename === 'Task' && object.id) return `Task:${object.id}`;
    if (object.__typename === 'UserProfile' && object.id) return `UserProfile:${object.id}`;
    return false;
  }) as KeyFieldsFunction
});

// Create a robust upload link with advanced configurations
const uploadLink = createUploadLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:8000/graphql',
  credentials: 'include', // Crucial for HTTP-only cookies
  headers: {
    'apollo-require-preflight': 'true',
  },
});

const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  if (graphQLErrors) {
    for (const err of graphQLErrors) {
      const errorCode = err.extensions?.code || 
                      (err.message.includes('Authentication required') ? 'UNAUTHENTICATED' : 'UNKNOWN_ERROR');

      switch (errorCode) {
        case 'UNAUTHENTICATED':
          // Don't redirect for the current user query to prevent infinite loops
          if (operation.operationName === 'GetCurrentUser') {
            return;
          }

          return new Observable(observer => {
            const tokenManager = new TokenRefreshManager();
            tokenManager.handleTokenRefresh()
              .then(user => {
                if (user) {
                  // Update cache with new user data
                  cache.writeQuery({
                    query: GET_CURRENT_USER_QUERY,
                    data: { me: { ...user, __typename: 'User', __timestamp: Date.now() } },
                  });

                  // Retry the failed request
                  const subscriber = {
                    next: observer.next.bind(observer),
                    error: observer.error.bind(observer),
                    complete: observer.complete.bind(observer)
                  };

                  forward(operation).subscribe(subscriber);
                } else {
                  // Clear Apollo cache
                  cache.reset();
                  
                  // Redirect to login with return URL
                  const returnUrl = typeof window !== 'undefined' ? 
                    encodeURIComponent(window.location.pathname + window.location.search) : '';
                  window.location.href = `/auth/sign-in?reason=session_expired&returnUrl=${returnUrl}`;
                }
              })
              .catch(error => {
                console.error('Token refresh failed:', error);
                cache.reset();
                window.location.href = '/auth/sign-in?reason=refresh_failed';
              });
          });
        
        case 'FORBIDDEN':
          toast.error('You do not have permission to perform this action');
          window.location.href = '/auth/unauthorized';
          break;

        case 'SECURITY_LEVEL_INSUFFICIENT':
          window.location.href = '/auth/mfa';
          break;
        
        case 'VALIDATION_ERROR':
          toast.error(err.message || 'Validation error occurred');
          break;
        
        case 'NOT_FOUND':
          toast.error(err.message || 'Resource not found');
          break;
        
        default:
          console.error('GraphQL Error:', err);
          toast.error(err.message || 'An unexpected error occurred');

          // Only redirect for severe errors
          if (err.message.includes('Internal server error')) {
            window.location.href = '/error?type=server_error';
          }
      }
    }
  }

  if (networkError) {
    console.error('Network error:', networkError);
    
    // Check if it's a CORS or network connectivity issue
    if ('statusCode' in networkError) {
      switch (networkError.statusCode) {
        case 0:
          toast.error('No internet connection');
          break;
        case 401:
          window.location.href = '/auth/sign-in';
          break;
        case 403:
          toast.error('Access forbidden');
          break;
        case 429:
          toast.error('Too many requests. Please try again later.');
          break;
        case 500:
          toast.error('Server error. Please try again later.');
          break;
        default:
          toast.error('Network error occurred');
      }
    }
  }

  // Continue with error policy
  return forward(operation);
});


export function getApolloClient() {
  // Ensure client-side only
  if (typeof window === 'undefined') return null;
  
  try {
    if (!apolloClient) {
      // Validate GraphQL URL
      const graphqlUrl = process.env.NEXT_PUBLIC_GRAPHQL_URL;
      if (!graphqlUrl) {
        console.error('GraphQL URL is not configured');
        return null;
      }

      apolloClient = new ApolloClient({
        link: from([
          errorLink,           // Error handling
          //contextLink,         // Dynamic context headers
          uploadLink           // File upload and network requests
        ]),
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
        console.error('Initial user data fetch failed:', error);
      });
    }

    return apolloClient;
  } catch (error) {
    console.error('Apollo Client initialization failed:', error);
    return null;
  }
}

export function resetApolloClient() {
  apolloClient = null;
}