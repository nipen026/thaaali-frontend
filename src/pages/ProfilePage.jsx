import { Mail, Shield, Building2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function ProfilePage() {
  const { user } = useAuth();
  const { t } = useLanguage();

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
        <div className="finput" style={{ background: 'var(--surface)', color: 'var(--slate)' }}>{user.email}</div>
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
