'use client';

import { ApolloClient, ApolloProvider, NormalizedCacheObject } from '@apollo/client';
import { loadErrorMessages, loadDevMessages } from "@apollo/client/dev";
import { getApolloClient } from './apollo-client';
import { useMemo, useState, useEffect } from 'react';
import EstateLoading from "@/components/loading";
import { ApolloErrorBoundary } from '@/components/apollo-error-boundary';

if (process.env.NODE_ENV === 'development') {
  loadDevMessages();
  loadErrorMessages();
}

function ConnectionError() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="rounded-lg bg-red-50 p-8 text-center">
        <h2 className="mb-2 text-lg font-semibold text-red-800">Connection Error</h2>
        <p className="text-red-600">
          Unable to connect to the server. Please check your connection and try again.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
        >
          Retry Connection
        </button>
      </div>
    </div>
  );
}

export function ApolloWrapper({ children }: React.PropsWithChildren) {
  const [mounted, setMounted] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    
    // Check if GraphQL URL is configured
    if (!process.env.NEXT_PUBLIC_GRAPHQL_URL) {
      console.error('GraphQL URL is not configured');
      setInitError('Server configuration error');
    }
  }, []);

  const client = useMemo(() => {
    try {
      const apolloClient = getApolloClient();
      if (!apolloClient && typeof window !== 'undefined') {
        setInitError('Unable to initialize Apollo Client');
        return null;
      }
      setInitError(null);
      return apolloClient;
    } catch (error) {
      console.error('Apollo Client initialization error:', error);
      setInitError(error instanceof Error ? error.message : 'Failed to initialize Apollo Client');
      return null;
    }
  }, []);

  // Don't render anything on the server
  if (!mounted) return null;

  // Show loading state if client is not yet available
  if (!client && !initError) {
    return <EstateLoading />;
  }

  // Show error state if initialization failed
  if (initError) {
    return <ConnectionError />;
  }

  return (
    <ApolloErrorBoundary>
      <ApolloProvider client={client!}>
        {children}
      </ApolloProvider>
    </ApolloErrorBoundary>
  );
}