'use client';

import { ApolloProvider } from '@apollo/client';
import { loadErrorMessages, loadDevMessages } from "@apollo/client/dev";
import { createApolloClient } from './apollo-client';

if (process.env.NODE_ENV === 'development') {
  loadDevMessages();
  loadErrorMessages();
}

let clientInstance: ReturnType<typeof createApolloClient>;

function getClient() {
  if (!clientInstance) {
    clientInstance = createApolloClient();
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