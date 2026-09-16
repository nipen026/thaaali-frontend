import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { authAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import AuthBrandPanel from '../components/auth/AuthBrandPanel';
import { useDocumentHead } from '../lib/useDocumentHead';

export default function VerifyEmailPage() {
  useDocumentHead({
    title: 'Verify Email — THAAALI',
    description: 'Confirm your email address to finish setting up your THAAALI account.',
    path: '/verify-email',
  });

  const [params] = useSearchParams();
  const token = params.get('token');
  const { user, refreshUser } = useAuth();
  const [state, setState] = useState('verifying'); // verifying | success | error
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) { setState('error'); setError('This verification link is missing its token.'); return; }
    let cancelled = false;
    authAPI.verifyEmail(token)
      .then(async () => {
        if (cancelled) return;
        if (user) await refreshUser().catch(() => {});
        setState('success');
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.response?.data?.error || 'This verification link is invalid or has expired.');
        setState('error');
      });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <div className="login-shell">
      <AuthBrandPanel />

      <div className="login-form-col">
        <motion.div className="login-box" style={{ textAlign: 'center' }}
          initial={{ opacity: 0, x: 32 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3, duration: 0.5 }}>

          {state === 'verifying' && (
            <>
              <motion.div style={{ display: 'inline-block', marginBottom: 16 }}
                animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}>
                <Loader2 size={40} style={{ color: 'var(--saffron-dark)' }} />
              </motion.div>
              <h2>Verifying your email…</h2>
              <p className="sub">Just a moment.</p>
            </>
          )}

          {state === 'success' && (
            <>
              <CheckCircle2 size={40} style={{ color: 'var(--jade)', marginBottom: 16 }} />
              <h2>Email verified</h2>
              <p className="sub">Your email address is confirmed. You're all set.</p>
              <Link to={user ? '/app/dashboard' : '/login'} className="btn btn-pr btn-lg"
                style={{ width: '100%', justifyContent: 'center', marginTop: 20 }}>
                {user ? 'Continue to Dashboard' : 'Sign In'}
              </Link>
            </>
          )}

          {state === 'error' && (
            <>
              <XCircle size={40} style={{ color: 'var(--crimson)', marginBottom: 16 }} />
              <h2>Verification failed</h2>
              <p className="sub">{error}</p>
              <Link to={user ? '/app/settings' : '/login'} className="btn btn-sc btn-lg"
                style={{ width: '100%', justifyContent: 'center', marginTop: 20 }}>
                {user ? 'Go to Settings to resend' : 'Back to Sign In'}
              </Link>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
