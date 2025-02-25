"use client";

import { useState, useEffect, useContext, createContext } from 'react';
import { useRouter } from 'next/navigation';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if the user has a token in localStorage
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
    setLoading(false); // Stop loading once the check is done
  }, []);

  useEffect(() => {
    if (!loading) {
      // If the user is authenticated and is trying to access login/register page, redirect to home
      if (isAuthenticated && (router.pathname === '/login' || router.pathname === '/register')) {
        router.push('/home'); // Redirect to the home page if authenticated
      }

      // If the user is authenticated and is already on the home page, replace the current history state
      if (isAuthenticated && router.pathname !== '/home') {
        // Use history.replaceState to prevent going back to login/register
        window.history.replaceState(null, '', '/home'); // Replace the history state with home
      }
    }
  }, [loading, isAuthenticated, router.pathname]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
