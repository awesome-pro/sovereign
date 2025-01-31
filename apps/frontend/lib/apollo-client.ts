import { ApolloClient, InMemoryCache, createHttpLink, from, Observable, FetchResult } from '@apollo/client';
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
      if (err.extensions?.code === 'UNAUTHENTICATED' || 
          err.message.toLowerCase().includes('unauthorized')) {

            // redirect to sign-in
            console.log(err);
            toast.error(err.message);
            //window.location.href = '/auth/sign-in'
        
        // return new Observable<FetchResult>((observer) => {
        //   tokenManager.handleTokenRefresh().then(success => {
        //     if (success) {
        //       // Retry the failed operation
        //       const subscriber = forward(operation).subscribe({
        //         next: (result) => observer.next(result),
        //         error: (error) => observer.error(error),
        //         complete: () => observer.complete(),
        //       });

        //       return () => subscriber.unsubscribe();
        //     } else {
        //       observer.error(new Error('Token refresh failed'));
        //     }
        //   });
        // });
      }
      
      // Show error message for other GraphQL errors
      toast.error(err.message);
    }
  }

  if (networkError) {
    console.error('[Network error]:', networkError);
    toast.error('Network error occurred. Please check your connection.');
  }
});

// WebSocket link with automatic reconnection
let wsLink: GraphQLWsLink | null = null;
if (typeof window !== 'undefined') {
  wsLink = new GraphQLWsLink(
    createClient({
      url: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/graphql',
      connectionParams: async () => {
        // Cookies will be sent automatically
        return {};
      },
      retryAttempts: 5,
      shouldRetry: (error) => {
        console.log('WS error, attempting reconnect:', error);
        return true;
      },
      connectionAckWaitTimeout: 5000,
    })
  );
}

export function createApolloClient() {
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