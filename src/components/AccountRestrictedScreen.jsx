import { Lock, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const STATUS_LABEL = {
  suspended: 'Account Suspended',
  cancelled: 'Subscription Cancelled',
  paused: 'Account Paused',
  on_hold: 'Account On Hold',
};

// Rendered above the whole app (see App.jsx) the moment any API call comes back 403 with an
// `account_status` — see backend's middleware/accountStatus.js. Full-screen and unclosable by
// design: the tenant can still log out, but not dismiss their way back into the app.
export default function AccountRestrictedScreen({ status, message, onDismiss }) {
  const { logout } = useAuth();
  const handleLogout = () => { logout(); onDismiss?.(); };
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999, background: 'var(--ink)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
    }}>
      <div className="card" style={{ maxWidth: 440, padding: 36, textAlign: 'center', background: 'var(--white)' }}>
        <div style={{
          width: 56, height: 56, borderRadius: '50%', background: 'var(--crimson-50)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
        }}>
          <Lock size={24} style={{ color: 'var(--crimson)' }} />
        </div>
        <h1 style={{ fontFamily: 'var(--font-d)', fontSize: 20, fontWeight: 800, marginBottom: 10 }}>
          {STATUS_LABEL[status] || 'Account Restricted'}
        </h1>
        <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.6, marginBottom: 24 }}>{message}</p>
        <button className="btn btn-sc" onClick={handleLogout}><LogOut size={15} /> Log Out</button>
      </div>
    </div>
  );
}
