"use client";

import { createContext, useContext, ReactNode, useCallback, useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useApolloClient } from '@apollo/client';
import { toast } from 'sonner';
import { LoginInput, RegisterInput, User } from '@/types';
import { GET_CURRENT_USER_QUERY, LOGOUT_MUTATION, REFRESH_TOKEN_MUTATION, SIGN_IN_MUTATION } from '@/graphql/auth.mutations';
import Cookies from 'js-cookie';

// Types for better type safety
interface SessionState {
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;  // New flag to track initial authentication check
  user: User | null;
  roles: string[];
  permissions: string[];
  error: string | null;
}

interface AuthContextType extends SessionState {
  signIn: (input: LoginInput) => Promise<User>;
  signUp: (input: RegisterInput) => Promise<User>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  hasPermission: (permissions: string | string[]) => boolean;
  hasRole: (roles: string | string[]) => boolean;
}

const initialState: SessionState = {
  isAuthenticated: false,
  isLoading: true,
  isInitialized: false,
  user: null,
  roles: [],
  permissions: [],
  error: null
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SessionState>(initialState);
  const router = useRouter();
  const client = useApolloClient();

  // GraphQL mutations
  const [loginMutation] = useMutation(SIGN_IN_MUTATION);
  const [logoutMutation] = useMutation(LOGOUT_MUTATION);
  const [refreshTokenMutation] = useMutation(REFRESH_TOKEN_MUTATION);

  const count = Cookies.get('count') as number;


  // Query for current user
  const { refetch: refetchUser } = useQuery(GET_CURRENT_USER_QUERY, {
    skip: !(count === 2), // Don't run automatically
    fetchPolicy: 'network-only',
    onError: handleAuthError
  });

  // Initialize authentication state
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Handle authentication errors
  function handleAuthError(error: any) {
    console.error('Auth error:', error);
    if (error.message.includes('UNAUTHENTICATED')) {
      setState(prev => ({
        ...initialState,
        isLoading: false,
        isInitialized: true
      }));
    }
    toast.error(error.message);
  }

  // Check authentication status
  async function checkAuthStatus() {
    try {
      

      // Only proceed if we have both tokens (count should be 2)
      const { data } = await refetchUser();
      if (data?.me) {
        setState(prev => ({
          ...prev,
          isAuthenticated: true,
          isLoading: false,
          isInitialized: true,
          user: data.me,
          roles: extractRoles(data.me),
          permissions: extractPermissions(data.me),
          error: null
        }));
      }
    } catch (error) {
      handleAuthError(error);
    }
  }

  // Refresh session
  const refreshSession = async () => {
    try {
      const { data } = await refreshTokenMutation();
      if (data?.refreshToken) {
        await checkAuthStatus();
        return;
      }
      throw new Error('Failed to refresh session');
    } catch (error) {
      handleAuthError(error);
      router.push('/auth/sign-in');
    }
  };

  // Sign in implementation
  const signIn = async (input: LoginInput): Promise<User> => {
    try {
      const { data } = await loginMutation({
        variables: { input }
      });

      const { user, accessToken, refreshToken } = data.login;
      console.log('user : ', user);
      console.log('accessToken : ', accessToken);
      console.log('refreshToken : ', refreshToken);
      
      // Update state with user data
      setState(prev => ({
        ...prev,
        isAuthenticated: true,
        isLoading: false,
        isInitialized: true,
        user,
        roles: extractRoles(user),
        permissions: extractPermissions(user),
        error: null
      }));

      await checkAuthStatus(); // Verify the session
      return user;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Authentication failed';
      toast.error(message);
      setState(prev => ({ ...prev, error: message }));
      throw error;
    }
  };

  // Sign out implementation
  const signOut = async () => {
    try {
      await logoutMutation();
      
      // Clear session and cookies
      const response = await fetch('/api/auth/session', {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to clear session');
      }
      
      // Clear all cookies
      document.cookie = 'accessToken=; Max-Age=0; path=/; domain=' + window.location.hostname;
      document.cookie = 'refreshToken=; Max-Age=0; path=/; domain=' + window.location.hostname;
      document.cookie = 'tokenCount=; Max-Age=0; path=/; domain=' + window.location.hostname;
      
      // Reset state and cache
      setState(initialState);
      await client.clearStore();
      
      router.push('/auth/sign-in');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to sign out');
      throw error;
    }
  };

  // Helper functions for role and permission checking
  const hasRole = useCallback((roleOrRoles: string | string[]): boolean => {
    const roles = Array.isArray(roleOrRoles) ? roleOrRoles : [roleOrRoles];
    return roles.some(role => state.roles.includes(role));
  }, [state.roles]);

  const hasPermission = useCallback((permissionOrPermissions: string | string[]): boolean => {
    const permissions = Array.isArray(permissionOrPermissions) 
      ? permissionOrPermissions 
      : [permissionOrPermissions];
    return permissions.some(permission => state.permissions.includes(permission));
  }, [state.permissions]);

  // Helper functions to extract roles and permissions
  function extractRoles(user: User): string[] {
    return user.roles.map(r => r.role.name);
  }

  function extractPermissions(user: User): string[] {
    return user.roles.flatMap(r => r.role.permissions.map(p => p.slug));
  }

  const contextValue = useMemo<AuthContextType>(() => ({
    ...state,
    signIn,
    signUp: async () => { throw new Error('Not implemented'); },
    signOut,
    refreshSession,
    hasRole,
    hasPermission,
  }), [state, hasRole, hasPermission]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}