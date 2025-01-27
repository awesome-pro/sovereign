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

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const client = useApolloClient();

  const [loginMutation] = useMutation(LOGIN_MUTATION);

  const { data: userData, loading: userLoading } = useQuery(GET_CURRENT_USER_QUERY, {
    skip: !Cookies.get('accessToken'),
    fetchPolicy: 'network-only',
  });

  const clearTokens = useCallback(() => {
    Cookies.remove('accessToken', { path: '/' });
  }, []);

  const logout = useCallback(async () => {
    clearTokens();
    setUser(null);
    await client.resetStore();
    router.push('/auth/sign-in');
  }, [client, router, clearTokens]);

  const handleAuthSuccess = useCallback((accessToken: string, user: User) => {
    Cookies.set('accessToken', accessToken, {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });
    setUser(user);
  }, []);

  const login = useCallback(async (input: LoginInput) => {
    try {
      const { data } = await loginMutation({
        variables: { input },
      });

      const { accessToken, user } = data.login;
      handleAuthSuccess(accessToken, user);

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
