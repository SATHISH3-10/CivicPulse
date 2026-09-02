import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function AuthCallback() {
  const { completeGoogleLogin } = useAuth();
  const navigate = useNavigate();

  const [error, setError] = useState('');
  const callbackStarted = useRef(false);

  useEffect(() => {
    if (callbackStarted.current) return;

    callbackStarted.current = true;

    async function finishLogin() {
      try {
        // ---------------------------------------------
        // 1. Check OAuth hash
        // ---------------------------------------------
        const hash = window.location.hash;

        const hashParams = new URLSearchParams(
          hash.replace(/^#/, '')
        );

        const authError =
          hashParams.get('error_description') ||
          hashParams.get('error');

        if (authError) {
          throw new Error(authError);
        }

        // ---------------------------------------------
        // 2. Get Supabase session
        // ---------------------------------------------
        let session = null;

        const {
          data,
          error: sessionError
        } = await supabase.auth.getSession();

        if (sessionError) {
          throw sessionError;
        }

        session = data?.session;

        // ---------------------------------------------
        // 3. Wait for Supabase if session isn't ready
        // ---------------------------------------------
        if (!session) {
          session = await new Promise((resolve, reject) => {
            let finished = false;

            const timeout = setTimeout(() => {
              if (finished) return;

              finished = true;
              subscription.unsubscribe();

              reject(
                new Error(
                  'Google session was not created'
                )
              );
            }, 10000);

            const {
              data: { subscription }
            } = supabase.auth.onAuthStateChange(
              (event, nextSession) => {
                if (
                  nextSession &&
                  (
                    event === 'SIGNED_IN' ||
                    event === 'INITIAL_SESSION'
                  )
                ) {
                  if (finished) return;

                  finished = true;
                  clearTimeout(timeout);
                  subscription.unsubscribe();

                  resolve(nextSession);
                }
              }
            );
          });
        }

        // ---------------------------------------------
        // 4. Validate access token
        // ---------------------------------------------
        if (!session?.access_token) {
          throw new Error(
            'Google access token was not created'
          );
        }

        // ---------------------------------------------
        // 5. Send Supabase token to CivicPulse backend
        // ---------------------------------------------
        const savedRole = localStorage.getItem('pending_login_role') || 'citizen';
        const authenticatedUser =
          await completeGoogleLogin(
            session.access_token,
            savedRole
          );

        if (!authenticatedUser) {
          throw new Error(
            'Backend did not return a user'
          );
        }

        // ---------------------------------------------
        // 6. Remove OAuth tokens from browser URL
        // ---------------------------------------------
        window.history.replaceState(
          {},
          document.title,
          '/auth/callback'
        );

        // ---------------------------------------------
        // 7. Determine destination
        // ---------------------------------------------
        const routes = {
          citizen: '/citizen',
          officer: '/officer',
          admin: '/admin'
        };

        const destination =
          routes[authenticatedUser.role] ||
          '/citizen';

        // ---------------------------------------------
        // 8. Navigate to dashboard
        // ---------------------------------------------
        navigate(destination, {
          replace: true
        });

      } catch (err) {
        console.error(
          'Google authentication failed:',
          err
        );

        setError(
          err?.response?.data?.error ||
          err?.message ||
          'Google login failed'
        );
      }
    }

    finishLogin();
  }, [completeGoogleLogin, navigate]);

  // ---------------------------------------------
  // UI
  // ---------------------------------------------
  return (
    <div className="auth-page">
      <div className="auth-card fade-in">

        {error ? (
          <>
            <h1>Google login failed</h1>

            <p style={{ margin: '16px 0' }}>
              {error}
            </p>

            <button
              className="btn btn-primary"
              onClick={() =>
                navigate('/login', {
                  replace: true
                })
              }
            >
              Back to login
            </button>
          </>
        ) : (
          <>
            <h2>Signing you in...</h2>

            <p>
              Completing Google sign in...
            </p>
          </>
        )}

      </div>
    </div>
  );
}