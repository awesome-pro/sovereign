"use client";

import { createContext, useContext, ReactNode, useCallback, useEffect, useReducer, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useMutation, useQuery, useApolloClient } from '@apollo/client';
import { toast } from 'sonner';
import { JWTRole, LoginInput, RegisterInput, User } from '@/types';
import { GET_CURRENT_USER_QUERY, LOGOUT_MUTATION, REFRESH_TOKEN_MUTATION, SIGN_IN_MUTATION } from '@/graphql/auth.mutations';
import Cookies from 'js-cookie';
import EstateLoading from '@/components/loading';

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

interface SecurityState {
  mfa: boolean;
  bio: boolean;
  dpl: number;
  rsk: number;
}

interface AuthState extends SessionState {
  effectiveRoles: string[];
  effectivePermissions: string[];
  securityState: SecurityState;
  deviceFingerprint: string | null;
}

type AuthAction = 
  | { type: 'INITIALIZE'; payload: AuthState }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'UPDATE_SESSION'; payload: Partial<AuthState> }
  | { type: 'SIGN_OUT' };

interface AuthContextType extends AuthState {
  signIn: (input: LoginInput) => Promise<User>;
  signUp: (input: RegisterInput) => Promise<User>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  hasRole: (roles: string | string[]) => boolean;
  hasPermission: (permissions: string | string[]) => boolean;
}

const initialState: AuthState = {
  isAuthenticated: false,
  isLoading: true,
  isInitialized: false,
  user: null,
  roles: [],
  permissions: [],
  effectiveRoles: [],
  effectivePermissions: [],
  securityState: {
    mfa: false,
    bio: false,
    dpl: 0,
    rsk: 0
  },
  deviceFingerprint: null,
  error: null
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'INITIALIZE':
      return { ...action.payload, isInitialized: true, isLoading: false };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'UPDATE_SESSION':
      return { ...state, ...action.payload };
    case 'SIGN_OUT':
      return { ...initialState, isInitialized: true };
    default:
      return state;
  }
};

const calculateEffectivePermissions = (roles: [string, number, string | null][], permissions: string[]): string[] => {
  const effectivePerms = new Set<string>();
  
  // Add direct permissions
  permissions.forEach(p => effectivePerms.add(p));
  
  // Add role-based permissions based on hierarchy
  roles.sort((a, b) => a[1] - b[1]); // Sort by hierarchy (0 is highest)
  roles.forEach(([role]) => {
    // Add role-specific permissions based on your permission structure
    const rolePerms = getRolePermissions(role);
    rolePerms.forEach(p => effectivePerms.add(p));
  });
  
  return Array.from(effectivePerms);
};

const calculateEffectiveRoles = (roles: [string, number, string | null][]) => {
  return roles.map(([role]) => role);
};

const getRolePermissions = (role: string) => {
  // Implement your role permission logic here
  return [];
};

const generateDeviceFingerprint = async () => {
  // Implement your device fingerprint generation logic here
  return null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const router = useRouter();
  const pathname = usePathname();
  const client = useApolloClient();

  // GraphQL mutations
  const [loginMutation] = useMutation(SIGN_IN_MUTATION);
  const [logoutMutation] = useMutation(LOGOUT_MUTATION);
  const [refreshTokenMutation] = useMutation(REFRESH_TOKEN_MUTATION);

  // Check if we're on an auth page
  const isAuthPage = pathname?.startsWith('/auth/');

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Try to refresh the session first
        const refreshResponse = await fetch('/api/auth/refresh', {
          method: 'POST',
          credentials: 'include',
        });

        if (!refreshResponse.ok) {
          // If refresh fails and we're not on an auth page, redirect to login
          if (!isAuthPage) {
            router.push('/auth/sign-in');
          }
          dispatch({ type: 'INITIALIZE', payload: { ...initialState, isInitialized: true } });
          return;
        }

        // If refresh successful, fetch current user
        const { data } = await client.query({
          query: GET_CURRENT_USER_QUERY,
          fetchPolicy: 'network-only',
        });

        if (data?.me) {
          const { roles, permissions, ...user } = data.me;
          const effectivePermissions = calculateEffectivePermissions(roles, permissions);
          
          dispatch({
            type: 'INITIALIZE',
            payload: {
              isAuthenticated: true,
              user,
              roles: roles.map((r: { roleHash: any; }) => r.roleHash),
              effectiveRoles: calculateEffectiveRoles(roles),
              permissions,
              effectivePermissions,
              securityState: {
                mfa: user.twoFactorEnabled || false,
                bio: false,
                dpl: 0,
                rsk: 0
              },
              deviceFingerprint: await generateDeviceFingerprint(),
              error: null,
              isLoading: false,
              isInitialized: true
            }
          });

          // Redirect to dashboard if on auth page
          if (isAuthPage) {
            router.push('/dashboard');
          }
        }
      } catch (error: any) {
        toast.error(error.message);
        console.error('Auth initialization error:', error);
        dispatch({ 
          type: 'INITIALIZE', 
          payload: { 
            ...initialState, 
            isInitialized: true,
            error: error.message 
          } 
        });
        
        if (!isAuthPage) {
          router.push('/auth/sign-in');
        }
      }
    };

    if (!state.isInitialized) {
      initAuth();
    }
  }, [client, router, isAuthPage, state.isInitialized]);

  const signIn = async (input: LoginInput): Promise<User> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      debugger;

      const { data } = await loginMutation({ 
        variables: { 
          input
        }
      });
      
      if (data?.login) {
        const { roles, permissions, ...user } = data.login.user;
        dispatch({
          type: 'UPDATE_SESSION',
          payload: {
            isAuthenticated: true,
            user,
            roles: roles.map((r:JWTRole) => r.roleHash),
            effectiveRoles: calculateEffectiveRoles(roles),
            permissions,
            effectivePermissions: calculateEffectivePermissions(roles, permissions),
            error: null
          }
        });
        
        return user;
      }
      
      throw new Error('Sign in failed');
    } catch (error: any) {
      toast.error(error.message);
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const signOut = async () => {
    try {
      await logoutMutation();
      await client.clearStore();
      dispatch({ type: 'SIGN_OUT' });
      router.push('/auth/sign-in');
    } catch (error: any) {
      toast.error(error.message);
      console.error('Logout error:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to sign out' });
    }
  };

  const hasRole = useCallback((requiredRoles: string | string[]): boolean => {
    const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
    return roles.some(role => state.effectiveRoles.includes(role));
  }, [state.effectiveRoles]);

  const hasPermission = useCallback((requiredPermissions: string | string[]): boolean => {
    const permissions = Array.isArray(requiredPermissions) ? requiredPermissions : [requiredPermissions];
    
    return permissions.some(permission => {
      // Handle wildcard permissions
      if (permission.endsWith('.*')) {
        const domain = permission.slice(0, -2);
        return state.effectivePermissions.some(p => p.startsWith(domain));
      }
      return state.effectivePermissions.includes(permission);
    });
  }, [state.effectivePermissions]);

  const refreshSession = async () => {
    try {
      const { data } = await refreshTokenMutation();
      if (data?.refreshToken) {
        const { roles, permissions, ...user } = data.refreshToken;
        dispatch({
          type: 'UPDATE_SESSION',
          payload: {
            user,
            roles: roles.map((r: { roleHash: any; }) => r.roleHash),
            effectiveRoles: calculateEffectiveRoles(roles),
            permissions,
            effectivePermissions: calculateEffectivePermissions(roles, permissions)
          }
        });
      }
    } catch (error: any) {
      toast.error(error.message);
      console.error('Session refresh error:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to refresh session' });
      signOut();
    }
  };

  const value = {
    ...state,
    signIn,
    signUp: async () => { throw new Error('Not implemented'); },
    signOut,
    refreshSession,
    hasRole,
    hasPermission
  };

  // Only show loading on protected routes
  if (!state.isInitialized && !isAuthPage) {
    return <EstateLoading />;
  }

  return (
    <AuthContext.Provider value={value}>
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