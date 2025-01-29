"use client"

import { createContext, useContext, ReactNode, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useApolloClient } from '@apollo/client';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';

import { AUTH_TOKEN_KEY, REFRESH_TOKEN_KEY } from '@/config/auth.config';
import { AuthState, LoginInput, RegisterInput, User } from '@/types';
import { GET_CURRENT_USER_QUERY, LOGIN_MUTATION, LOGOUT_MUTATION, REFRESH_TOKEN_MUTATION } from '@/graphql/auth.mutations';

interface AuthContextType extends AuthState {
  login: (input: LoginInput) => Promise<User>;
  //register: (input: RegisterInput) => Promise<User>;
  logout: () => Promise<void>;
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
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const client = useApolloClient();
  
  const [login] = useMutation(LOGIN_MUTATION);
  const [logout] = useMutation(LOGOUT_MUTATION);
  const [refreshTokenMutation] = useMutation(REFRESH_TOKEN_MUTATION);
  
  const { data: userData, loading: userLoading } = useQuery(GET_CURRENT_USER_QUERY, {
    skip: !Cookies.get(AUTH_TOKEN_KEY),
  });

  const state: AuthState = {
    isAuthenticated: !!userData?.me,
    isLoading: userLoading,
    user: userData?.me || null,
    roles: userData?.me?.roles.map((r: any) => r.name) || [],
    permissions: userData?.me?.permissions || [],
  };

  const handleLogin = async (input: LoginInput): Promise<User> => {
    const { data } = await login({
      variables: {
        input: {
          email: input.email,
          password: input.password,
          twoFactorToken: input.twoFactorToken
        }
      }
    });

    const { accessToken, refreshToken, user } = data.login;

    // Store tokens
    Cookies.set(AUTH_TOKEN_KEY, accessToken, { 
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });
    
    Cookies.set(REFRESH_TOKEN_KEY, refreshToken, { 
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: 7, // 7 days
    });

    return user;
  };

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      // Clear tokens and cache
      Cookies.remove(AUTH_TOKEN_KEY);
      Cookies.remove(REFRESH_TOKEN_KEY);
      await client.clearStore();
      router.push('/login');
    }
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
    const currentRefreshToken = Cookies.get(REFRESH_TOKEN_KEY);
    if (!currentRefreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const { data } = await refreshTokenMutation({
        variables: { refreshToken: currentRefreshToken },
      });

      const { accessToken, refreshToken } = data.refreshToken;

      Cookies.set(AUTH_TOKEN_KEY, accessToken, { secure: true, sameSite: 'strict' });
      Cookies.set(REFRESH_TOKEN_KEY, refreshToken, { secure: true, sameSite: 'strict' });
    } catch (error) {
      // If refresh fails, logout user
      await handleLogout();
      throw error;
    }
  };

  const hasRole = (roleOrRoles: string | string[]): boolean => {
    const roles = Array.isArray(roleOrRoles) ? roleOrRoles : [roleOrRoles];
    return roles.some(role => state.roles.includes(role));
  };

  const hasPermission = (permissionOrPermissions: string | string[]): boolean => {
    const permissions = Array.isArray(permissionOrPermissions) 
      ? permissionOrPermissions 
      : [permissionOrPermissions];
    return permissions.some(permission => state.permissions.includes(permission));
  };

  // Set up token refresh interval
  useEffect(() => {
    if (state.isAuthenticated) {
      const token = Cookies.get(AUTH_TOKEN_KEY);
      if (token) {
        const decoded = jwtDecode(token);
        const expiresIn = ((decoded as any).exp * 1000) - Date.now();
        const refreshTime = Math.max(expiresIn - 60000, 0); // Refresh 1 minute before expiry

        const refreshInterval = setInterval(() => {
          refreshToken().catch(console.error);
        }, refreshTime);

        return () => clearInterval(refreshInterval);
      }
    }
  }, [state.isAuthenticated]);

  // Initial auth check
  useEffect(() => {
    checkAuth().catch(console.error);
  }, []);

  const contextValue: AuthContextType = {
    ...state,
    login: handleLogin,
    logout: handleLogout,
    checkAuth,
    hasRole,
    hasPermission,
    refreshToken,
  };

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
