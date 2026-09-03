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
  // Complete Google login: Supabase access token -> CivicPulse JWT
  // --------------------------------------------------
  const completeGoogleLogin = useCallback(async (accessToken, role) => {
    if (!accessToken) {
      throw new Error(
        'Google access token is missing'
      );
    }

    const savedRole = role || localStorage.getItem('pending_login_role') || 'citizen';

    try {
      const res = await api.post('/auth/google', {
        accessToken,
        role: savedRole
      });

      localStorage.removeItem('pending_login_role');

      const authenticatedUser = res.data?.user;

      if (!res.data?.token || !authenticatedUser) {
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
    } catch (err) {
      // Netlify / Static hosting / offline fallback when backend server is unavailable
      const { data: supaData } = await supabase.auth.getUser();
      const supaUser = supaData?.user;

      const fallbackUser = {
        _id: supaUser?.id || 'usr_google_' + Date.now(),
        name: supaUser?.user_metadata?.full_name || supaUser?.user_metadata?.name || supaUser?.email?.split('@')[0] || 'Google User',
        email: supaUser?.email || 'googleuser@civicpulse.demo',
        role: savedRole,
        city: 'Chennai'
      };

      const fallbackToken = 'demo-jwt-google-' + savedRole;

      localStorage.removeItem('pending_login_role');
      localStorage.setItem('civicpulse_token', fallbackToken);
      localStorage.setItem('civicpulse_user', JSON.stringify(fallbackUser));

      setUser(fallbackUser);

      return fallbackUser;
    }
  }, []);

  // --------------------------------------------------
  // Google Identity Services ID token -> Supabase session
  // --------------------------------------------------
  const loginWithGoogle = useCallback(async (idToken, role = 'citizen') => {
    if (!isSupabaseConfigured) {
      const demoUser = {
        _id: 'usr_google_' + Date.now(),
        name: 'Google User',
        email: 'googleuser@civicpulse.demo',
        role,
        city: 'Chennai'
      };
      const demoToken = 'demo-jwt-google-' + role;
      localStorage.setItem('civicpulse_token', demoToken);
      localStorage.setItem('civicpulse_user', JSON.stringify(demoUser));
      setUser(demoUser);
      return demoUser;
    }

    if (!idToken) {
      throw new Error('Google did not return an ID token. Please try again.');
    }

    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: idToken
    });

    if (error) throw error;

    const accessToken = data.session?.access_token;
    if (!accessToken) {
      throw new Error('Supabase did not create a Google session.');
    }

    return completeGoogleLogin(accessToken, role);
  }, [completeGoogleLogin]);

  // --------------------------------------------------
  // Google OAuth Redirect flow (Supabase OAuth)
  // --------------------------------------------------
  const signInWithGoogleOAuth = useCallback(async (role = 'citizen') => {
    localStorage.setItem('pending_login_role', role);

    if (!isSupabaseConfigured) {
      const demoUser = {
        _id: 'usr_google_' + Date.now(),
        name: 'Google User',
        email: 'googleuser@civicpulse.demo',
        role,
        city: 'Chennai'
      };
      const demoToken = 'demo-jwt-google-' + role;
      localStorage.setItem('civicpulse_token', demoToken);
      localStorage.setItem('civicpulse_user', JSON.stringify(demoUser));
      setUser(demoUser);
      return demoUser;
    }

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/login'
      }
    });

    if (error) throw error;
    return data;
  }, []);

  // Listen for Supabase auth state changes (OAuth redirects from Google)
  useEffect(() => {
    if (!isSupabaseConfigured) return undefined;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session?.access_token) {
        const token = localStorage.getItem('civicpulse_token');
        if (!token || token.startsWith('demo-jwt-google')) {
          const pendingRole = localStorage.getItem('pending_login_role') || 'citizen';
          try {
            await completeGoogleLogin(session.access_token, pendingRole);
          } catch (e) {
            console.error('Error completing Google OAuth login:', e);
          }
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [completeGoogleLogin]);

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
        signInWithGoogleOAuth,
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
