"use client"

import { createContext, useContext, ReactNode, useCallback, useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useApolloClient } from '@apollo/client';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';

import { AUTH_TOKEN_KEY, REFRESH_TOKEN_KEY } from '@/config/auth.config';
import { AuthState, LoginInput, RegisterInput, User } from '@/types';
import { GET_CURRENT_USER_QUERY, SIGN_IN_MUTATION, LOGOUT_MUTATION, REFRESH_TOKEN_MUTATION } from '@/graphql/auth.mutations';

interface AuthContextType extends AuthState {
  signIn: (input: LoginInput) => Promise<User>;
  signUp: (input: RegisterInput) => Promise<User>;
  signOut: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
  hasRole: (role: string | string[]) => boolean;
  hasPermission: (permission: string | string[]) => boolean;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const initialState: AuthState = {
  isAuthenticated: false,
  isLoading: true,
  user: null,
  roles: [],
  permissions: [],
  error: null
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(initialState);
  const router = useRouter();
  const client = useApolloClient();
  
  const [loginMutation] = useMutation(SIGN_IN_MUTATION);
  const [logoutMutation] = useMutation(LOGOUT_MUTATION);
  const [refreshTokenMutation] = useMutation(REFRESH_TOKEN_MUTATION);

  const { data: userData, loading: userLoading, refetch: refetchUser } = useQuery(GET_CURRENT_USER_QUERY, {
    skip: !Cookies.get(AUTH_TOKEN_KEY),
    fetchPolicy: 'network-only',
  });

  useEffect(() => {
    if (!userLoading) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        isAuthenticated: !!userData?.me,
        user: userData?.me || null,
        roles: userData?.me?.roles.map((r: any) => r.role.name) || [],
        permissions: userData?.me?.roles.flatMap((r: any) => 
          r.role.permissions.map((p: any) => p.slug)
        ) || [],
      }));
    }
  }, [userData, userLoading]);

  const signIn = async (input: LoginInput): Promise<User> => {
    try {
      const { data } = await loginMutation({
        variables: { input }
      });

      const { accessToken, refreshToken, user } = data.login;

      // Set httpOnly cookies via API
      await fetch('/api/auth/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accessToken, refreshToken }),
        credentials: 'include',
      });

      // Update local state
      setState(prev => ({
        ...prev,
        isAuthenticated: true,
        isLoading: false,
        user,
        roles: user.roles.map((r: any) => r.role.name),
        permissions: user.roles.flatMap((r: any) => 
          r.role.permissions.map((p: any) => p.slug)
        ),
        error: null,
      }));

      // Refetch user data to ensure everything is in sync
      await refetchUser();

      return user;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'An error occurred during sign in',
      }));
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await logoutMutation();
      
      // Clear cookies through API
      await fetch('/api/auth/session', {
        method: 'DELETE',
        credentials: 'include',
      });
      
      // Clear local state
      setState(initialState);

      // Clear Apollo cache
      await client.clearStore();
      
      router.push('/auth/sign-in');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const signUp = async (input: RegisterInput): Promise<User> => {
    // Implement signup logic here
    throw new Error('Not implemented');
  };

  const checkAuth = useCallback(async (): Promise<boolean> => {
    const token = Cookies.get(AUTH_TOKEN_KEY);
    if (!token) return false;

    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      
      if ((decoded as any).exp < currentTime) {
        await refreshToken();
      }
      
      return true;
    } catch {
      return false;
    }
  }, []);

  const refreshToken = async () => {
    try {
      const { data } = await refreshTokenMutation();
      const { accessToken, refreshToken } = data.refreshToken;

      await fetch('/api/auth/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accessToken, refreshToken }),
        credentials: 'include',
      });

      await refetchUser();
    } catch (error) {
      await signOut();
      throw error;
    }
  };

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

  useEffect(() => {
    if (state.isAuthenticated) {
      const token = Cookies.get(AUTH_TOKEN_KEY);
      if (token) {
        const decoded = jwtDecode(token);
        const expiresIn = ((decoded as any).exp * 1000) - Date.now();
        const refreshTime = Math.max(expiresIn - 60000, 0); // Refresh 1 minute before expiry

        const refreshInterval = setInterval(refreshToken, refreshTime);
        return () => clearInterval(refreshInterval);
      }
    }
  }, [state.isAuthenticated]);

  const contextValue = useMemo<AuthContextType>(() => ({
    ...state,
    signIn,
    signUp,
    signOut,
    checkAuth,
    hasRole,
    hasPermission,
    refreshToken,
  }), [state, hasRole, hasPermission, checkAuth]);

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
