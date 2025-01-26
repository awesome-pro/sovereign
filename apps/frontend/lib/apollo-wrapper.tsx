'use client';

import { HttpLink, ApolloLink } from '@apollo/client';
import {
  ApolloClient,
  ApolloProvider,
  InMemoryCache,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { loadErrorMessages, loadDevMessages } from "@apollo/client/dev";
import Cookies from 'js-cookie';

if (process.env.NODE_ENV === 'development') {
  loadDevMessages();
  loadErrorMessages();
}

function makeClient() {
  const httpLink = new HttpLink({
    uri: process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:8000/graphql',
    credentials: 'include',
  });

  const authLink = setContext((_, { headers }) => {
    const token = Cookies.get('accessToken');
    return {
      headers: {
        ...headers,
        authorization: token ? `Bearer ${token}` : '',
      },
    };
  });

  const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
    if (graphQLErrors) {
      for (const err of graphQLErrors) {
        if (err.extensions?.code === 'UNAUTHENTICATED') {
          // Handle token refresh here
          const refreshToken = localStorage.getItem('refreshToken');
          if (refreshToken) {
            // Implement token refresh logic
            return forward(operation);
          }
        }
        console.error(
          `[GraphQL error]: Message: ${err.message}, Location: ${err.locations}, Path: ${err.path}`,
        );
      }
    }
    if (networkError) {
      console.error(`[Network error]: ${networkError}`);
    }
  });

  return new ApolloClient({
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
    link: ApolloLink.from([errorLink, authLink, httpLink]),
  });
}

let clientInstance: ApolloClient<any>;

function getClient() {
  if (!clientInstance) {
    clientInstance = makeClient();
  }
  return clientInstance;
}

export function ApolloWrapper({ children }: React.PropsWithChildren) {
  return (
    <ApolloProvider client={getClient()}>
      {children}
    </ApolloProvider>
  );
}
