import { useState } from 'react';
import toast from 'react-hot-toast';
import { Mail, Shield, Building2, BadgeCheck, BadgeAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { authAPI } from '../api';

export default function ProfilePage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [resending, setResending] = useState(false);
  const [sent, setSent] = useState(false);

  const resendVerification = async () => {
    setResending(true);
    try {
      await authAPI.resendVerification();
      setSent(true);
      toast.success('Verification email sent');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not send verification email');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="card" style={{ padding: 24, maxWidth: 560 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
        <div className="sb-av" style={{ width: 56, height: 56, fontSize: 18 }}>{user.avatar}</div>
        <div>
          <div style={{ fontFamily: 'var(--font-d)', fontSize: 18, fontWeight: 800, color: 'var(--ink)' }}>{user.name}</div>
          <div style={{ fontSize: 12.5, color: 'var(--muted)', textTransform: 'capitalize' }}>{user.role.replace('_', ' ')}</div>
        </div>
      </div>

      <div className="fgrp">
        <label className="flbl"><Mail size={12} style={{ verticalAlign: -1, marginRight: 4 }} />{t('common.email', 'Email')}</label>
        <div className="finput" style={{ background: 'var(--surface)', color: 'var(--slate)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <span>{user.email}</span>
          {user.emailVerified ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 700, color: 'var(--jade)', flexShrink: 0 }}>
              <BadgeCheck size={14} />{t('profile.emailVerified', 'Verified')}
            </span>
          ) : (
            <span style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 700, color: '#92400e' }}>
                <BadgeAlert size={14} />{t('profile.emailUnverified', 'Not verified')}
              </span>
              <button type="button" className="btn btn-gh" style={{ padding: '4px 10px', fontSize: 11.5 }}
                onClick={resendVerification} disabled={resending || sent}>
                {sent ? t('profile.verificationSent', 'Sent') : t('profile.resendVerification', 'Resend verification email')}
              </button>
            </span>
          )}
        </div>
      </div>

      <div className="grid-2 gap-3">
        <div className="fgrp">
          <label className="flbl"><Shield size={12} style={{ verticalAlign: -1, marginRight: 4 }} />{t('profile.role', 'Role')}</label>
          <div className="finput" style={{ background: 'var(--surface)', color: 'var(--slate)', textTransform: 'capitalize' }}>
            {user.role.replace('_', ' ')}
          </div>
        </div>
        <div className="fgrp">
          <label className="flbl"><Building2 size={12} style={{ verticalAlign: -1, marginRight: 4 }} />{t('profile.accountId', 'Account ID')}</label>
          <div className="finput" style={{ background: 'var(--surface)', color: 'var(--slate)' }}>{user.id}</div>
        </div>
      </div>
    </div>
  );
}
