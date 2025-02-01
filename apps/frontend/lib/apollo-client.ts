import { ApolloClient, InMemoryCache, createHttpLink, from, Observable, NormalizedCacheObject } from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { toast } from 'sonner';

// Create a class to manage token refresh state
class TokenRefreshManager {
  private isRefreshing = false;
  private pendingRequests: Function[] = [];

  async handleTokenRefresh() {
    if (this.isRefreshing) {
      return new Promise(resolve => {
        this.pendingRequests.push(resolve);
      });
    }

    this.isRefreshing = true;

    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      // Resolve all pending requests
      this.pendingRequests.forEach(callback => callback());
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      window.location.href = '/auth/sign-in';
      return false;
    } finally {
      this.isRefreshing = false;
      this.pendingRequests = [];
    }
  }
}

export function createApolloClient(): ApolloClient<NormalizedCacheObject> {
  const tokenManager = new TokenRefreshManager();

  const httpLink = createHttpLink({
    uri: process.env.NEXT_PUBLIC_GRAPHQL_URL,
    credentials: 'include',
    fetchOptions: {
      credentials: 'include',
    },
  });

  const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
    if (graphQLErrors) {
      for (const err of graphQLErrors) {
        switch (err.extensions?.code) {
          case 'UNAUTHENTICATED':
          // return new Observable(observer => {
          //   tokenManager.handleTokenRefresh()
          //     .then(success => {
          //       if (success) {
          //         // Retry the failed request
          //         const subscriber = forward(operation);
          //         subscriber.subscribe(observer);
          //       } else {
          //         window.location.href = '/auth/sign-in?reason=session_expired';
          //       }
          //     })
          //     .catch(() => {
          //       window.location.href = '/auth/sign-in?reason=refresh_failed';
          //     });
          // });
            window.location.href = '/auth/sign-in?reason=session_expired';
            break;
          case 'FORBIDDEN':
            window.location.href = '/auth/unauthorized';
            break;
          case 'SECURITY_LEVEL_INSUFFICIENT':
            window.location.href = '/auth/mfa';
            break;
        }
      }
    }

    if (networkError) {
      console.error('Network error:', networkError);
      toast.error('Network error occurred. Please try again.');
    }
  });

  const wsLink = typeof window !== 'undefined'
    ? new GraphQLWsLink(
        createClient({
          url: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/graphql',
          connectionParams: async () => {
            const dfp = localStorage.getItem('dfp');
            return {
              'X-Device-Fingerprint': dfp,
              'X-Request-Security-Level': '3'
            };
          },
          retryAttempts: 5,
          shouldRetry: (error) => {
            console.log('WS error, attempting reconnect:', error);
            return true;
          },
          connectionAckWaitTimeout: 5000,
        })
      )
    : null;

  return new ApolloClient({
    link: from([errorLink, httpLink]),
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
        errorPolicy: 'all',
      },
      query: {
        fetchPolicy: 'network-only',
        errorPolicy: 'all',
      },
      mutate: {
        errorPolicy: 'all',
      },
    },
    connectToDevTools: process.env.NODE_ENV === 'development',
  });
}