"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/utils/useAuth';

const withAuth = (WrappedComponent) => {
  return (props) => {
    const { isAuthenticated, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      // If user is not authenticated, send them to login page
      if (!loading && !isAuthenticated) {
        router.push('/login');
      }
      // If user is authenticated and is on the login/register page, redirect to home
      else if (!loading && isAuthenticated && (router.pathname === '/login' || router.pathname === '/register')) {
        router.push('/home');
      }
    }, [loading, isAuthenticated, router.pathname]);

    useEffect(() => {
      if (!loading && isAuthenticated) {
        // Use history.replaceState to prevent going back to login/register pages
        window.history.replaceState(null, '', '/home'); // Redirect them to home in history
      }
    }, [loading, isAuthenticated, router.pathname]);

    if (loading) return <p>Loading...</p>;

    return <WrappedComponent {...props} />;
  };
};

export default withAuth;
