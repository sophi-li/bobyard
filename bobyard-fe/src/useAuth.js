import { useState, useEffect } from 'react';
import { signup, login, logout, getCurrentUser } from './api/auth.js';

export function useAuth() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    async function restoreSession() {
      try {
        let user = await getCurrentUser();
        setCurrentUser(user);
      } catch (e) {
        setAuthError(e.message);
      } finally {
        setIsAuthLoading(false);
      }
    }
    restoreSession();
  }, []);

  const handleSignup = async ({ username, password }) => {
    setAuthError(null);
    try {
      let user = await signup({ username, password });
      setCurrentUser(user);
    } catch (e) {
      setAuthError(e.message);
      throw e;
    }
  };

  const handleLogin = async ({ username, password }) => {
    setAuthError(null);
    try {
      let user = await login({ username, password });
      setCurrentUser(user);
    } catch (e) {
      setAuthError(e.message);
      throw e;
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      // Log the user out locally even if the request failed, since a stale
      // cookie the server no longer recognizes shouldn't leave the UI stuck
      // showing a logged-in state.
      setCurrentUser(null);
    }
  };

  return {
    currentUser,
    isAuthLoading,
    authError,
    setAuthError,
    signup: handleSignup,
    login: handleLogin,
    logout: handleLogout
  };
}
