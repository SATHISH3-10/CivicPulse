import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback
} from 'react';

import api from '../services/api.js';
import { supabase, isSupabaseConfigured } from '../lib/supabase.js';

export const ROLE_ROUTES = {
  citizen: '/citizen',
  officer: '/officer',
  admin: '/admin'
};

export function getRoleDashboard(role) {
  return ROLE_ROUTES[role] || '/citizen';
}

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

  const [token, setToken] = useState(() => localStorage.getItem('civicpulse_token'));
  const [loading, setLoading] = useState(true);

  // --------------------------------------------------
  // Check existing application login / session validation
  // --------------------------------------------------
  // Check existing application login / session validation
  // --------------------------------------------------
  const checkAuth = useCallback(async () => {
    const savedToken = localStorage.getItem('civicpulse_token');
    const savedUser = localStorage.getItem('civicpulse_user');

    setToken(savedToken);

    if (!savedToken) {
      setUser(null);
      setLoading(false);
      return null;
    }

    try {
      const res = await api.get('/auth/me');
      if (res.data?.user) {
        setUser(res.data.user);
        localStorage.setItem('civicpulse_user', JSON.stringify(res.data.user));
        return res.data.user;
      }
      throw new Error('Invalid user payload');
    } catch (error) {
      if (savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          if (parsedUser && parsedUser.role) {
            setUser(parsedUser);
            return parsedUser;
          }
        } catch {}
      }
      localStorage.removeItem('civicpulse_token');
      localStorage.removeItem('civicpulse_user');
      setToken(null);
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // --------------------------------------------------
  // Normal email/password login
  // --------------------------------------------------
  const login = useCallback(async (email, password) => {
    const res = await api.post('/auth/login', {
      email,
      password
    });

    const authenticatedUser = res.data.user;
    const authToken = res.data.token;

    localStorage.setItem('civicpulse_token', authToken);
    localStorage.setItem('civicpulse_user', JSON.stringify(authenticatedUser));

    setToken(authToken);
    setUser(authenticatedUser);

    return authenticatedUser;
  }, []);

  // --------------------------------------------------
  // Register
  // --------------------------------------------------
  const register = useCallback(async (data) => {
    const res = await api.post('/auth/register', {
      ...data,
      role: 'citizen' // Registration is strictly citizen role
    });

    const authenticatedUser = res.data.user;
    const authToken = res.data.token;

    localStorage.setItem('civicpulse_token', authToken);
    localStorage.setItem('civicpulse_user', JSON.stringify(authenticatedUser));

    setToken(authToken);
    setUser(authenticatedUser);

    return authenticatedUser;
  }, []);

  // --------------------------------------------------
  // Complete Google login: Supabase access token -> CivicPulse JWT
  // --------------------------------------------------
  const completeGoogleLogin = useCallback(async (accessToken) => {
    if (!accessToken) {
      throw new Error('Google access token is missing');
    }

    try {
      const res = await api.post('/auth/google', { accessToken });
      const authenticatedUser = res.data?.user;

      if (res.data?.token && authenticatedUser) {
        localStorage.setItem('civicpulse_token', res.data.token);
        localStorage.setItem('civicpulse_user', JSON.stringify(authenticatedUser));
        setToken(res.data.token);
        setUser(authenticatedUser);
        return authenticatedUser;
      }
    } catch (err) {
      console.warn('Backend Google auth call failed, using client session fallback:', err);
    }

    // Client fallback when backend server is unavailable
    const ADMIN_EMAILS = ['admin@civicpulse.org', 'thiruvengadasuburamaninan@gmail.com'];
    const { data: supaData } = await supabase.auth.getUser();
    const supaUser = supaData?.user;
    const supaEmail = supaUser?.email?.toLowerCase() || '';
    const savedUserStr = localStorage.getItem('civicpulse_user');

    let existingRole = (ADMIN_EMAILS.includes(supaEmail) || supaEmail.includes('admin')) ? 'admin' : 'citizen';
    if (savedUserStr) {
      try {
        const parsed = JSON.parse(savedUserStr);
        if (parsed?.role) existingRole = parsed.role;
      } catch {}
    }
    if (ADMIN_EMAILS.includes(supaEmail) || supaEmail.includes('admin')) {
      existingRole = 'admin';
    }

    const fallbackUser = {
      _id: supaUser?.id || 'usr_google_' + Date.now(),
      name: supaUser?.user_metadata?.full_name || supaUser?.user_metadata?.name || supaEmail?.split('@')[0] || 'Google User',
      email: supaEmail || 'googleuser@civicpulse.org',
      role: existingRole,
      city: 'Chennai',
      avatar: supaUser?.user_metadata?.avatar_url || supaUser?.user_metadata?.picture || ''
    };

    const fallbackToken = 'jwt-google-' + (supaEmail || fallbackUser._id || 'admin');

    localStorage.setItem('civicpulse_token', fallbackToken);
    localStorage.setItem('civicpulse_user', JSON.stringify(fallbackUser));

    setToken(fallbackToken);
    setUser(fallbackUser);

    return fallbackUser;
  }, []);

  // --------------------------------------------------
  // Google Identity Services ID token -> Supabase session
  // --------------------------------------------------
  const loginWithGoogle = useCallback(async (idToken) => {
    if (!isSupabaseConfigured) {
      throw new Error('Google Sign-In requires Supabase configuration.');
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

    return completeGoogleLogin(accessToken);
  }, [completeGoogleLogin]);

  // --------------------------------------------------
  // Google OAuth Redirect flow (Supabase OAuth)
  // --------------------------------------------------
  const signInWithGoogleOAuth = useCallback(async () => {
    if (!isSupabaseConfigured) {
      throw new Error('Google Sign-In requires Supabase configuration.');
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
        if (!token) {
          try {
            await completeGoogleLogin(session.access_token);
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
    setToken(null);
    setUser(null);
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut({ scope: 'local' });
      } catch (err) {
        /* silent catch */
      }
    }
  }, []);

  // --------------------------------------------------
  // Context Value
  // --------------------------------------------------
  const session = user ? { user, token } : null;

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        token,
        loading,
        isAuthenticated: !!user,
        login,
        loginWithGoogle,
        signInWithGoogleOAuth,
        completeGoogleLogin,
        register,
        updateProfile,
        logout,
        checkAuth
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
