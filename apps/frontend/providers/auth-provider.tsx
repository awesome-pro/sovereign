import { createContext, useContext, useCallback, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { gql } from '@apollo/client';
import { useApolloClient } from '@apollo/client';

interface User {
  id: string;
  email: string;
  roles: Array<{
    role: {
      name: string;
    };
  }>;
  profile?: {
    firstName: string;
    lastName: string;
    avatar?: string;
  };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, twoFactorToken?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
}

const LOGIN_MUTATION = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      accessToken
      refreshToken
      user {
        id
        email
        roles {
          role {
            name
          }
        }
        profile {
          firstName
          lastName
          avatar
        }
      }
    }
  }
`;

const REFRESH_TOKEN_MUTATION = gql`
  mutation RefreshToken($input: RefreshTokenInput!) {
    refreshToken(input: $input) {
      accessToken
      refreshToken
    }
  }
`;

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const client = useApolloClient();

  const login = useCallback(async (email: string, password: string, twoFactorToken?: string) => {
    try {
      const { data } = await client.mutate({
        mutation: LOGIN_MUTATION,
        variables: {
          input: {
            email,
            password,
            twoFactorToken,
          },
        },
      });

      const { accessToken, refreshToken, user } = data.login;
      
      // Store tokens securely
      localStorage.setItem('refreshToken', refreshToken);
      sessionStorage.setItem('accessToken', accessToken);
      
      setUser(user);
      router.push('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }, [client, router]);

  const logout = useCallback(async () => {
    localStorage.removeItem('refreshToken');
    sessionStorage.removeItem('accessToken');
    setUser(null);
    await client.resetStore();
    router.push('/login');
  }, [client, router]);

  const refreshToken = useCallback(async () => {
    const storedRefreshToken = localStorage.getItem('refreshToken');
    if (!storedRefreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const { data } = await client.mutate({
        mutation: REFRESH_TOKEN_MUTATION,
        variables: {
          input: {
            refreshToken: storedRefreshToken,
          },
        },
      });

      const { accessToken, refreshToken } = data.refreshToken;
      localStorage.setItem('refreshToken', refreshToken);
      sessionStorage.setItem('accessToken', accessToken);
    } catch (error) {
      console.error('Token refresh error:', error);
      await logout();
    }
  }, [client, logout]);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const accessToken = sessionStorage.getItem('accessToken');
        if (accessToken) {
          // Verify token and get user data
          // Implementation depends on your backend setup
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
