"use client";

import React, {
  createContext,
  useContext,
  ReactNode,
  useCallback,
  useEffect,
  useReducer,
  useMemo,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { useMutation } from "@apollo/client";
import { toast } from "sonner";
import { JWTRole, LoginInput, RegisterInput, User, UserPermission } from "@/types";
import {
  GET_CURRENT_USER_QUERY,
  LOGOUT_MUTATION,
  REFRESH_TOKEN_MUTATION,
  SIGN_IN_MUTATION,
} from "@/graphql/mutations/auth.mutations";
import EstateLoading from "@/components/loading";
import { getApolloClient, resetApolloClient } from "@/lib/apollo-client";
import { hasPermission as checkPermission, RequiredPermission } from '@/utils/permissions';

// --------------------
// Types & Interfaces
// --------------------
interface SessionState {
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  user: User | null;
  roles: string[];
  permissions: UserPermission[];
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
  effectivePermissions: UserPermission[];
  securityState: SecurityState;
  deviceFingerprint: string | null;
}

type AuthAction =
  | { type: "INITIALIZE"; payload: AuthState }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "UPDATE_SESSION"; payload: Partial<AuthState> }
  | { type: "SIGN_OUT" };

interface AuthContextType extends AuthState {
  signIn: (input: LoginInput) => Promise<User>;
  signUp: (input: RegisterInput) => Promise<User>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  hasRole: (roles: string | string[]) => boolean;
  hasPermission: (permissions: RequiredPermission | RequiredPermission[], requireAll?: boolean) => boolean;
}

// --------------------
// Initial State & Reducer
// --------------------
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
    rsk: 0,
  },
  deviceFingerprint: null,
  error: null,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case "INITIALIZE":
      return { ...action.payload, isInitialized: true, isLoading: false };
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    case "UPDATE_SESSION":
      return { ...state, ...action.payload };
    case "SIGN_OUT":
      return { ...initialState, isInitialized: true };
    default:
      return state;
  }
};

// --------------------
// Helper Functions
// --------------------
const calculateEffectivePermissions = (
  roles: JWTRole[],
  permissions: UserPermission[]
): UserPermission[] => {
  const effectivePerms = new Set<UserPermission>();
  permissions.forEach((p) => effectivePerms.add(p));
  roles
    .sort((a, b) => a.hierarchy - b.hierarchy)
    .forEach((role) => {
      const rolePerms = getRolePermissions(role.roleHash);
      rolePerms.forEach((p) => effectivePerms.add(p));
    });
  return Array.from(effectivePerms);
};

/**
 * Calculate effective roles from the provided role objects.
 */
const calculateEffectiveRoles = (roles: JWTRole[]): string[] => {
  return roles.map((role) => role.roleHash);
};

/**
 * Placeholder for a function to derive role-based permissions.
 * Extend this to incorporate your permission structure.
 */
const getRolePermissions = (role: string): UserPermission[] => {
  return [];
};

/**
 * Generate a device fingerprint for security. Consider using a library
 * such as FingerprintJS.
 */
const generateDeviceFingerprint = async (): Promise<string | null> => {
  const clientFingerprint = generateClientFingerprint();
  if (typeof window !== 'undefined') {
    localStorage.setItem('dfp', clientFingerprint);
  }
  return clientFingerprint;
};

const generateClientFingerprint = (): string => {
  if (typeof window === 'undefined') return '';
  
  const components = [
    navigator.userAgent,
    navigator.language,
    screen.width,
    screen.height,
    new Date().getTimezoneOffset(),
    navigator.hardwareConcurrency,
    navigator.platform,
  ];
  
  const fingerprint = components.join('|');
  return btoa(fingerprint);
};

// --------------------
// Context & Provider
// --------------------
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const [mounted, setMounted] = React.useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const apolloClient = useMemo(() => getApolloClient(), []);

  const [loginMutation] = useMutation(SIGN_IN_MUTATION);
  const [logoutMutation] = useMutation(LOGOUT_MUTATION);
  const [refreshTokenMutation] = useMutation(REFRESH_TOKEN_MUTATION);

  const isAuthPage = pathname?.startsWith("/auth/");
  
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      if (!apolloClient) return;

      try {
        dispatch({ type: "SET_LOADING", payload: true });
        
        const clientFingerprint = await generateDeviceFingerprint();
        
        const sessionResponse = await fetch("/api/auth/session", {
          method: "GET",
          credentials: "include",
          headers: {
            'X-Client-Fingerprint': clientFingerprint || '',
            'User-Agent': navigator.userAgent
          }
        });

        if (sessionResponse.redirected && !isAuthPage) {
          router.push(sessionResponse.url);
          return;
        }

        const session = await sessionResponse.json();

        if (session?.isSignedIn && sessionResponse.ok) {
          let userData = session.user;
          
          if (!userData) {
            try {
              const { data } = await apolloClient.query({
                query: GET_CURRENT_USER_QUERY,
                fetchPolicy: "network-only",
              });
              userData = data?.me;
            } catch (error) {
              console.error("Failed to fetch user data:", error);
              dispatch({
                type: "INITIALIZE",
                payload: { ...initialState, error: "Failed to fetch user data" }
              });
              return;
            }
          }

          if (userData) {
            // Ensure roles and permissions are arrays
            const roles = Array.isArray(userData.roles) ? userData.roles : [];
            const permissions = Array.isArray(userData.permissions) ? userData.permissions : [];
            
            const effectiveRoles = calculateEffectiveRoles(roles);
            const effectivePermissions = calculateEffectivePermissions(roles, permissions);

            const securityState = {
              mfa: userData.twoFactorEnabled || false,
              bio: false,
              dpl: 0,
              rsk: 0,
            };

            dispatch({
              type: "INITIALIZE",
              payload: {
                ...initialState,
                isAuthenticated: true,
                user: {
                  ...userData,
                  roles,
                  permissions,
                },
                roles: roles.map((r: { roleHash: string }) => r.roleHash),
                effectiveRoles,
                permissions,
                effectivePermissions,
                securityState,
                deviceFingerprint: clientFingerprint,
                error: null,
                isLoading: false,
              },
            });

            if (isAuthPage) router.push("/dashboard");
            return;
          }
        }

        dispatch({
          type: "INITIALIZE",
          payload: {
            ...initialState,
            isLoading: false,
            error: session?.error || null,
          },
        });

        if (!isAuthPage) router.push("/auth/sign-in");
      } catch (error: any) {
        console.error("Auth initialization error:", error);
        dispatch({
          type: "INITIALIZE",
          payload: { ...initialState, isLoading: false, error: error.message },
        });
        if (!isAuthPage) router.push("/auth/sign-in");
      }
    };

    if (!state.isInitialized && mounted) {
      initAuth();
    }
  }, [apolloClient, router, isAuthPage, state.isInitialized, mounted]);

  const signIn = useCallback(
    async (input: LoginInput): Promise<User> => {
      if (!apolloClient) throw new Error("Apollo Client not initialized");

      dispatch({ type: "SET_LOADING", payload: true });
      try {
        const { data } = await loginMutation({
          variables: { input },
          fetchPolicy: "no-cache",
        });

        if (data?.login?.user) {
          const { roles, permissions, ...user } = data.login.user;
          dispatch({
            type: "UPDATE_SESSION",
            payload: {
              isAuthenticated: true,
              user,
              roles: roles.map((r: { roleHash: string }) => r.roleHash),
              effectiveRoles: calculateEffectiveRoles(roles),
              permissions,
              effectivePermissions: calculateEffectivePermissions(roles, permissions),
              error: null,
            },
          });
          return user;
        }
        throw new Error("Sign in failed");
      } catch (error: any) {
        toast.error(error.message);
        dispatch({ type: "SET_ERROR", payload: error.message });
        throw error;
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    },
    [loginMutation, apolloClient]
  );

  const signOut = useCallback(async () => {
    if (!apolloClient) return;

    try {
      await logoutMutation();
      await apolloClient.clearStore();
      resetApolloClient();
      dispatch({ type: "SIGN_OUT" });
      router.push("/auth/sign-in");
    } catch (error: any) {
      toast.error(error.message);
      console.error("Logout error:", error);
      dispatch({ type: "SET_ERROR", payload: "Failed to sign out" });
    }
  }, [logoutMutation, apolloClient, router]);

  const signUp = useCallback(async (input: RegisterInput): Promise<User> => {
    throw new Error("Not implemented");
  }, []);

  const refreshSession = useCallback(async () => {
    if (!apolloClient) return;

    try {
      const { data } = await refreshTokenMutation({
        fetchPolicy: "no-cache",
      });
      if (data?.refreshToken) {
        const { roles, permissions, ...user } = data.refreshToken;
        dispatch({
          type: "UPDATE_SESSION",
          payload: {
            user,
            roles: roles.map((r: { roleHash: string }) => r.roleHash),
            effectiveRoles: calculateEffectiveRoles(roles),
            permissions,
            effectivePermissions: calculateEffectivePermissions(roles, permissions),
          },
        });
      }
    } catch (error: any) {
      toast.error(error.message);
      console.error("Session refresh error:", error);
      dispatch({ type: "SET_ERROR", payload: "Failed to refresh session" });
      await signOut();
    }
  }, [refreshTokenMutation, apolloClient, signOut]);

  const hasRole = useCallback(
    (requiredRoles: string | string[]): boolean => {
      const rolesArray = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
      return rolesArray.some((role) => state.effectiveRoles.includes(role));
    },
    [state.effectiveRoles]
  );

  const hasPermission = useCallback(
    (requiredPermissions: RequiredPermission | RequiredPermission[], requireAll = false): boolean => {
      return checkPermission(state.permissions, requiredPermissions, requireAll);
    },
    [state.permissions]
  );

  const value = useMemo(
    () => ({
      ...state,
      signIn,
      signUp,
      signOut,
      refreshSession,
      hasRole,
      hasPermission,
    }),
    [state, signIn, signUp, signOut, refreshSession, hasRole, hasPermission]
  );

  if (!mounted) {
    return null;
  }

  if (!state.isInitialized && !isAuthPage) {
    return <EstateLoading />;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}
