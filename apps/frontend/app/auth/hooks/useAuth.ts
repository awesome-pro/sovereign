"use client"

import { useState, useCallback, useEffect, useRef } from 'react';
import { useMutation, useQuery, useApolloClient } from '@apollo/client';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import {
  LOGIN_MUTATION,
  REGISTER_MUTATION,
  REFRESH_TOKEN_MUTATION,
  GET_CURRENT_USER_QUERY,
} from '../graphql/auth.operations';
import type { User, LoginInput, RegisterInput } from '../types';

const TOKEN_REFRESH_INTERVAL = 4 * 60 * 1000; // 4 minutes
const TOKEN_EXPIRY_BUFFER = 10 * 1000; // 10 seconds

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();
  const client = useApolloClient();

  const [loginMutation] = useMutation(LOGIN_MUTATION);
  const [registerMutation] = useMutation(REGISTER_MUTATION);
  const [refreshTokenMutation] = useMutation(REFRESH_TOKEN_MUTATION);

  const { data: userData, loading: userLoading } = useQuery(GET_CURRENT_USER_QUERY, {
    skip: !Cookies.get('accessToken'),
    fetchPolicy: 'network-only',
  });

  const clearTokens = useCallback(() => {
    Cookies.remove('accessToken', { path: '/' });
    localStorage.removeItem('refreshToken');
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = null;
    }
  }, []);

  const logout = useCallback(async () => {
    clearTokens();
    setUser(null);
    await client.resetStore();
    router.push('/login');
  }, [client, router, clearTokens]);

  const refreshToken = useCallback(async () => {
    if (isRefreshing) return false;

    try {
      setIsRefreshing(true);
      const storedRefreshToken = localStorage.getItem('refreshToken');
      if (!storedRefreshToken) {
        throw new Error('No refresh token available');
      }

      const { data } = await refreshTokenMutation({
        variables: {
          input: { refreshToken: storedRefreshToken },
        },
      });

      const { accessToken, refreshToken: newRefreshToken } = data.refreshToken;

      Cookies.set('accessToken', accessToken, {
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      });
      localStorage.setItem('refreshToken', newRefreshToken);

      // Schedule next refresh
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
      refreshTimeoutRef.current = setTimeout(() => {
        refreshToken();
      }, TOKEN_REFRESH_INTERVAL - TOKEN_EXPIRY_BUFFER);

      return true;
    } catch (error) {
      console.error('Token refresh error:', error);
      await logout();
      return false;
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshTokenMutation, logout, isRefreshing]);

  const handleAuthSuccess = useCallback((accessToken: string, refreshToken: string, user: User) => {
    Cookies.set('accessToken', accessToken, {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });
    localStorage.setItem('refreshToken', refreshToken);
    setUser(user);

    // Schedule token refresh
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }
    refreshTimeoutRef.current = setTimeout(() => {
      refreshToken();
    }, TOKEN_REFRESH_INTERVAL - TOKEN_EXPIRY_BUFFER);
  }, [refreshToken]);

  const login = useCallback(async (input: LoginInput) => {
    try {
      const { data } = await loginMutation({
        variables: { input },
      });

      const { accessToken, refreshToken, user } = data.login;
      handleAuthSuccess(accessToken, refreshToken, user);

      // Redirect based on user role and status
      if (user.status === 'PENDING_VERIFICATION') {
        router.push('/verify-email');
        return user;
      }

      const primaryRole = user.roles[0]?.role.name;
      if (primaryRole === 'SUPER_ADMIN' || primaryRole === 'ADMIN') {
        router.push('/admin/dashboard');
      } else if (primaryRole === 'COMPANY_ADMIN') {
        router.push('/company/dashboard');
      } else {
        router.push('/dashboard');
      }

      return user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }, [loginMutation, router, handleAuthSuccess]);

  const register = useCallback(async (input: RegisterInput) => {
    try {
      const { data } = await registerMutation({
        variables: { input },
      });

      const { accessToken, refreshToken, user } = data.register;
      handleAuthSuccess(accessToken, refreshToken, user);
      router.push('/verify-email');
      return user;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }, [registerMutation, router, handleAuthSuccess]);

  const checkAuth = useCallback(async () => {
    const accessToken = Cookies.get('accessToken');
    if (!accessToken && !isRefreshing) {
      const refreshed = await refreshToken();
      if (!refreshed) {
        return false;
      }
    }
    return true;
  }, [refreshToken, isRefreshing]);

  useEffect(() => {
    if (userData?.me) {
      setUser(userData.me);
    }
    if (!userLoading) {
      setLoading(false);
    }
  }, [userData, userLoading]);

  // Setup initial refresh token interval when component mounts
  useEffect(() => {
    const accessToken = Cookies.get('accessToken');
    if (accessToken) {
      refreshToken();
    }
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
        refreshTimeoutRef.current = null;
      }
    };
  }, []); // Empty dependency array as we only want this to run once on mount

  return {
    user,
    loading,
    login,
    register,
    logout,
    checkAuth,
  };
}
