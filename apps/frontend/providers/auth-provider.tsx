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
import { useMutation, useApolloClient } from "@apollo/client";
import { toast } from "sonner";
import { JWTRole, LoginInput, RegisterInput, User } from "@/types";
import {
  GET_CURRENT_USER_QUERY,
  LOGOUT_MUTATION,
  REFRESH_TOKEN_MUTATION,
  SIGN_IN_MUTATION,
} from "@/graphql/auth.mutations";
import EstateLoading from "@/components/loading";

// --------------------
// Types & Interfaces
// --------------------
interface SessionState {
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean; // Track initial auth check
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
  hasPermission: (permissions: string | string[]) => boolean;
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
/**
 * Calculate effective permissions by merging direct user permissions
 * with those granted by roles (sorted by hierarchy).
 */
const calculateEffectivePermissions = (
  roles: JWTRole[],
  permissions: string[]
): string[] => {
  const effectivePerms = new Set<string>();
  permissions.forEach((p) => effectivePerms.add(p));
  roles
    .sort((a, b) => a.hierarchy - b.hierarchy) // Lower hierarchy value = higher privileges
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
const getRolePermissions = (role: string): string[] => {
  // TODO: Implement your permission lookup logic here.
  return [];
};

/**
 * Generate a device fingerprint for security. Consider using a library
 * such as FingerprintJS.
 */
const generateDeviceFingerprint = async (): Promise<string | null> => {
  // Placeholder: implement or plug in third-party library logic.
  return "generated-device-fingerprint";
};

const generateClientFingerprint = (): string => {
  const components = [
    navigator.userAgent,
    navigator.language,
    screen.width,
    screen.height,
    new Date().getTimezoneOffset(),
    navigator.hardwareConcurrency,
    navigator.platform,
  ];
  
  // Create a hash of the components
  const fingerprint = components.join('|');
  return btoa(fingerprint); // Base64 encode for transmission
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
  const client = useApolloClient();

  // Apollo GraphQL mutations for auth
  const [loginMutation] = useMutation(SIGN_IN_MUTATION);
  const [logoutMutation] = useMutation(LOGOUT_MUTATION);
  const [refreshTokenMutation] = useMutation(REFRESH_TOKEN_MUTATION);

  const isAuthPage = pathname?.startsWith("/auth/");

  // Handle client-side mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  // --------------------
  // Initial Session Check / Refresh
  // --------------------
  useEffect(() => {
    const initAuth = async () => {
      try {
        dispatch({ type: "SET_LOADING", payload: true });
        
        // Generate client fingerprint
        const clientFingerprint = generateClientFingerprint();
        
        // Attempt to refresh session from server (cookie-based, HttpOnly)
        const sessionResponse = await fetch("/api/auth/session", {
          method: "GET",
          credentials: "include",
          headers: {
            'X-Client-Fingerprint': clientFingerprint,
            'User-Agent': navigator.userAgent // Explicitly send browser's user agent
          }
        });

        // Handle any redirect response (if session endpoint redirects on error)
        if (sessionResponse.redirected) {
          router.push(sessionResponse.url);
          return;
        }

        const session = await sessionResponse.json();

        // If session exists and is valid
        if (session?.isSignedIn) {
          let userData = session.user;
          if (!userData) {
            // Fallback: query current user data via GraphQL
            const { data } = await client.query({
              query: GET_CURRENT_USER_QUERY,
              fetchPolicy: "network-only", // Ensure we always get the latest data
            });
            userData = data?.me;
          }

          if (userData) {
            const effectiveRoles = calculateEffectiveRoles(userData.roles);
            const effectivePermissions = calculateEffectivePermissions(
              userData.roles,
              userData.permissions
            );
            dispatch({
              type: "INITIALIZE",
              payload: {
                ...initialState,
                isAuthenticated: true,
                user: userData,
                roles: userData.roles.map((r: { roleHash: string }) => r.roleHash),
                effectiveRoles,
                permissions: userData.permissions,
                effectivePermissions,
                deviceFingerprint: await generateDeviceFingerprint(),
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
            error: session?.error || "Session expired. Please sign in again.",
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
  }, [client, router, isAuthPage, state.isInitialized, mounted]);

  // --------------------
  // Auth Actions
  // --------------------
  const signIn = useCallback(
    async (input: LoginInput): Promise<User> => {
      dispatch({ type: "SET_LOADING", payload: true });
      try {
        const { data } = await loginMutation({
          variables: { input },
          fetchPolicy: "no-cache", // Always hit the server
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
    [loginMutation]
  );

  const signOut = useCallback(async () => {
    try {
      await logoutMutation();
      // Clear Apollo store to remove cached sensitive data
      await client.clearStore();
      dispatch({ type: "SIGN_OUT" });
      router.push("/auth/sign-in");
    } catch (error: any) {
      toast.error(error.message);
      console.error("Logout error:", error);
      dispatch({ type: "SET_ERROR", payload: "Failed to sign out" });
    }
  }, [logoutMutation, client, router]);

  // Placeholder for signUp – implement similarly when needed.
  const signUp = useCallback(async (input: RegisterInput): Promise<User> => {
    throw new Error("Not implemented");
  }, []);

  const refreshSession = useCallback(async () => {
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
  }, [refreshTokenMutation, signOut]);

  const hasRole = useCallback(
    (requiredRoles: string | string[]): boolean => {
      const rolesArray = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
      return rolesArray.some((role) => state.effectiveRoles.includes(role));
    },
    [state.effectiveRoles]
  );

  const hasPermission = useCallback(
    (requiredPermissions: string | string[]): boolean => {
      const permsArray = Array.isArray(requiredPermissions) ? requiredPermissions : [requiredPermissions];
      return permsArray.some((permission) => {
        // Support wildcard permissions (e.g., "admin.*")
        if (permission.endsWith(".*")) {
          const domain = permission.slice(0, -2);
          return state.effectivePermissions.some((p) => p.startsWith(domain));
        }
        return state.effectivePermissions.includes(permission);
      });
    },
    [state.effectivePermissions]
  );

  // Memoize the context value to avoid unnecessary re-renders.
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

  // Render nothing until mounted to prevent hydration issues
  if (!mounted) {
    return null;
  }

  // Render a loading indicator on protected routes if not yet initialized
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
