"use client"

import { useState, useCallback, useEffect } from 'react';
import { useMutation, useQuery, useApolloClient } from '@apollo/client';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import {
  LOGIN_MUTATION,
  GET_CURRENT_USER_QUERY,
} from '@/graphql/auth.mutations';
import type { User, LoginInput } from '@/types';
import { AUTH_TOKEN_KEY, REFRESH_TOKEN_KEY } from '@/config/auth.config';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const client = useApolloClient();

  const [loginMutation] = useMutation(LOGIN_MUTATION);

  const { data: userData, loading: userLoading } = useQuery(GET_CURRENT_USER_QUERY, {
    skip: !Cookies.get(AUTH_TOKEN_KEY),
    fetchPolicy: 'network-only',
  });

  const clearTokens = useCallback(() => {
    Cookies.remove(AUTH_TOKEN_KEY, { path: '/' });
    Cookies.remove(REFRESH_TOKEN_KEY, { path: '/' });
  }, []);

  const logout = useCallback(async () => {
    clearTokens();
    setUser(null);
    await client.resetStore();
    router.push('/auth/sign-in');
  }, [client, router, clearTokens]);

  const handleAuthSuccess = useCallback((accessToken: string, refreshToken: string, user: User) => {
    Cookies.set('accessToken', accessToken, {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });
    
    Cookies.set('refreshToken', refreshToken, {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: 7, // 7 days
    });
    
    setUser(user);
  }, []);

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

  const checkAuth = useCallback(async () => {
    return !!Cookies.get('accessToken');
  }, []);

  useEffect(() => {
    if (userData?.me) {
      setUser(userData.me);
    }
    if (!userLoading) {
      setLoading(false);
    }
  }, [userData, userLoading]);

  return {
    user,
    loading,
    login,
    logout,
    checkAuth,
  };
}
