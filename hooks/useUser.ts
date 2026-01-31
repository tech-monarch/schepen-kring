"use client";

import { useState, useEffect } from 'react';
import { tokenUtils } from '@/utils/auth';

export interface User {
  id: string;
  name: string;
  email: string;
  role: {
    id: string;
    name: 'admin' | 'partner' | 'client';
  };
  [key: string]: any;
}

export const useUser = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUser = () => {
      try {
        const userData = tokenUtils.getUser();
        setUser(userData);
      } catch (error) {
        console.error('Error loading user data:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    // Initial load
    loadUser();

    // Set up periodic check for user data changes (e.g., after login)
    const userCheckInterval = setInterval(() => {
      const currentUserData = tokenUtils.getUser();
      if (currentUserData && (!user || user.id !== currentUserData.id)) {
        setUser(currentUserData);
      } else if (!currentUserData && user) {
        setUser(null);
      }
    }, 1000);

    // Clear interval after 10 seconds to avoid continuous checking
    const clearTimer = setTimeout(() => {
      clearInterval(userCheckInterval);
    }, 10000);

    return () => {
      clearInterval(userCheckInterval);
      clearTimeout(clearTimer);
    };
  }, []);

  return {
    user,
    isLoading,
    userType: user?.role?.name || 'client',
    isAuthenticated: !!user,
  };
};