import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback
} from 'react';

import api from '../services/api.js';
import { supabase, isSupabaseConfigured } from '../lib/supabase.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('civicpulse_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      localStorage.removeItem('civicpulse_user');
      return null;
    }
  });

  const [loading, setLoading] = useState(true);

  // --------------------------------------------------
  // Check existing application login
  // --------------------------------------------------
  useEffect(() => {
    let active = true;

    async function checkAuth() {
      const token = localStorage.getItem('civicpulse_token');
      const savedUser = localStorage.getItem('civicpulse_user');

      if (!token) {
        if (active) {
          setUser(null);
          setLoading(false);
        }
        return;
      }

      // Preserve demo login sessions on Netlify / static deployment
      if (token.startsWith('demo-') || savedUser?.includes('civicpulse.demo')) {
        if (active) {
          setUser(savedUser ? JSON.parse(savedUser) : null);
          setLoading(false);
        }
        return;
      }

      try {
        const res = await api.get('/auth/me');

        if (!active) return;

        setUser(res.data.user);
        localStorage.setItem(
          'civicpulse_user',
          JSON.stringify(res.data.user)
        );
      } catch (error) {
        if (!active) return;

        if (savedUser && savedUser.includes('civicpulse.demo')) {
          setUser(JSON.parse(savedUser));
        } else {
          localStorage.removeItem('civicpulse_token');
          localStorage.removeItem('civicpulse_user');
          setUser(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    checkAuth();

    return () => {
      active = false;
    };
  }, []);

  // --------------------------------------------------
  // Normal email/password login
  // --------------------------------------------------
  const login = useCallback(async (email, password) => {
    const res = await api.post('/auth/login', {
      email,
      password
    });

    const authenticatedUser = res.data.user;

    localStorage.setItem(
      'civicpulse_token',
      res.data.token
    );

    localStorage.setItem(
      'civicpulse_user',
      JSON.stringify(authenticatedUser)
    );

    setUser(authenticatedUser);

    return authenticatedUser;
  }, []);

  // --------------------------------------------------
  // Register
  // --------------------------------------------------
  const register = useCallback(async (data) => {
    const res = await api.post('/auth/register', data);

    const authenticatedUser = res.data.user;

    localStorage.setItem(
      'civicpulse_token',
      res.data.token
    );

    localStorage.setItem(
      'civicpulse_user',
      JSON.stringify(authenticatedUser)
    );

    setUser(authenticatedUser);

    return authenticatedUser;
  }, []);

  // --------------------------------------------------
  // Google OAuth login
  // --------------------------------------------------
  // Google OAuth login
  // --------------------------------------------------
  const loginWithGoogle = useCallback(async (role = 'citizen') => {
    if (!isSupabaseConfigured) {
      throw new Error(
        'Supabase is not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to Netlify Environment Variables.'
      );
    }
    if (role) {
      localStorage.setItem('pending_login_role', role);
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });

    if (error) throw error;
  }, []);

  // --------------------------------------------------
  // Complete Google login
  // Supabase access token -> CivicPulse JWT
  // --------------------------------------------------
  const completeGoogleLogin = useCallback(async (accessToken, role) => {
    if (!accessToken) {
      throw new Error(
        'Google access token is missing'
      );
    }

    const savedRole = role || localStorage.getItem('pending_login_role') || 'citizen';

    const res = await api.post('/auth/google', {
      accessToken,
      role: savedRole
    });

    localStorage.removeItem('pending_login_role');

    const authenticatedUser = res.data.user;

    if (!res.data.token || !authenticatedUser) {
      throw new Error(
        'Backend did not return a valid login response'
      );
    }

    localStorage.setItem(
      'civicpulse_token',
      res.data.token
    );

    localStorage.setItem(
      'civicpulse_user',
      JSON.stringify(authenticatedUser)
    );

    setUser(authenticatedUser);

    return authenticatedUser;
  }, []);

  // --------------------------------------------------
  // Update Profile
  // --------------------------------------------------
  const updateProfile = useCallback(async (data) => {
    const res = await api.put('/auth/profile', data);
    const updatedUser = res.data.user;

    localStorage.setItem(
      'civicpulse_user',
      JSON.stringify(updatedUser)
    );

    setUser(updatedUser);
    return updatedUser;
  }, []);

  // --------------------------------------------------
  // Logout
  // --------------------------------------------------
  const logout = useCallback(async () => {
    localStorage.removeItem('civicpulse_token');
    localStorage.removeItem('civicpulse_user');
    setUser(null);
  }, []);

  // --------------------------------------------------
  // Context
  // --------------------------------------------------
  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        loginWithGoogle,
        completeGoogleLogin,
        register,
        updateProfile,
        logout,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// --------------------------------------------------
// useAuth hook
// --------------------------------------------------
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth must be used within AuthProvider'
    );
  }

  return context;
}