"use client";

import { createContext, useContext, ReactNode, useCallback, useEffect, useReducer, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useMutation, useQuery, useApolloClient } from '@apollo/client';
import { toast } from 'sonner';
import { JWTRole, LoginInput, RegisterInput, User } from '@/types';
import { GET_CURRENT_USER_QUERY, LOGOUT_MUTATION, REFRESH_TOKEN_MUTATION, SIGN_IN_MUTATION } from '@/graphql/auth.mutations';
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

const calculateEffectivePermissions = (roles: JWTRole[], permissions: string[]): string[] => {
  const effectivePerms = new Set<string>();
  
  // Add direct permissions
  permissions.forEach(p => effectivePerms.add(p));
  
  // Add role-based permissions based on hierarchy
  roles.sort((a, b) => a.hierarchy - b.hierarchy); // Sort by hierarchy (0 is highest)
  roles.forEach(role => {
    // Add role-specific permissions based on your permission structure
    const rolePerms = getRolePermissions(role.roleHash);
    rolePerms.forEach(p => effectivePerms.add(p));
  });
  
  return Array.from(effectivePerms);
};

const calculateEffectiveRoles = (roles: JWTRole[]): string[] => {
  return roles.map(role => role.roleHash);
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
        debugger;
        
        // Try to refresh the session first
        const checkSessionResponse = await fetch('/api/auth/session', {
          method: 'GET',
          credentials: 'include',
        });

        // Handle redirects
        if (checkSessionResponse.redirected) {
          router.push(checkSessionResponse.url);
          return;
        }

        const session = await checkSessionResponse.json();

        if (checkSessionResponse.ok && session.isSignedIn) {
          // Update state with user data if available
          if (session.user) {
            const effectiveRoles = calculateEffectiveRoles(session.user.roles);
            const effectivePermissions = calculateEffectivePermissions(session.user.roles, session.user.permissions);

            dispatch({
              type: 'INITIALIZE',
              payload: {
                ...initialState,
                isAuthenticated: true,
                user: session.user,
                roles: session.user.roles.map((r: { roleHash: any; }) => r.roleHash),
                effectiveRoles,
                permissions: session.user.permissions,
                effectivePermissions,
                isLoading: false,
                error: null
              }
            });

            // Only redirect if we're on an auth page
            if (isAuthPage) {
              router.push('/dashboard');
            }
            return;
          }

          // If no user data in session, fetch from API
          const { data } = await client.query({
            query: GET_CURRENT_USER_QUERY,
            fetchPolicy: 'network-only',
          });

          if (data?.me) {
            const { roles, permissions, ...user } = data.me;
            const effectiveRoles = calculateEffectiveRoles(roles);
            const effectivePermissions = calculateEffectivePermissions(roles, permissions);
            
            dispatch({
              type: 'INITIALIZE',
              payload: {
                ...initialState,
                isAuthenticated: true,
                user,
                roles: roles.map((r: { roleHash: any; }) => r.roleHash),
                effectiveRoles,
                permissions,
                effectivePermissions,
                deviceFingerprint: await generateDeviceFingerprint(),
                error: null,
                isLoading: false
              }
            });
  
            // Only redirect if we're on an auth page
            if (isAuthPage) {
              router.push('/dashboard');
            }
            return;
          }
        }

        // If we get here, we're not authenticated
        dispatch({
          type: 'INITIALIZE',
          payload: {
            ...initialState,
            isLoading: false,
            error: session.error || 'Session expired. Please sign in again.'
          }
        });

        if (!isAuthPage) {
          router.push('/auth/sign-in');
        }
      } catch (error: any) {
        console.error('Auth initialization error:', error);
        
        dispatch({ 
          type: 'INITIALIZE', 
          payload: { 
            ...initialState,
            isLoading: false,
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
      
      if (data?.login?.user) {
        const { roles, permissions, ...user } = data.login.user;
        
        dispatch({
          type: 'UPDATE_SESSION',
          payload: {
            isAuthenticated: true,
            user,
            roles: roles.map((r: { roleHash: any; }) => r.roleHash),
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