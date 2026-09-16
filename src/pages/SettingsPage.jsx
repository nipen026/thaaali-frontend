import { useState } from 'react';
import toast from 'react-hot-toast';
import { Sun, Moon, MonitorSmartphone, Languages, Lock, Eye, EyeOff } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage, LANGUAGES } from '../context/LanguageContext';
import { authAPI } from '../api';

const THEME_OPTIONS = [
  { key: 'light', labelKey: 'chrome.light', label: 'Light', descKey: 'settings.themeLightDesc', desc: 'Always use the light theme', Icon: Sun },
  { key: 'dark', labelKey: 'chrome.dark', label: 'Dark', descKey: 'settings.themeDarkDesc', desc: 'Always use the dark theme', Icon: Moon },
  { key: 'system', labelKey: 'chrome.system', label: 'System', descKey: 'settings.themeSystemDesc', desc: 'Match your device setting', Icon: MonitorSmartphone },
];

function PasswordField({ id, label, value, onChange, autoComplete }) {
  const [show, setShow] = useState(false);
  return (
    <div className="fgrp">
      <label className="flbl" htmlFor={id}>
        <Lock size={12} style={{ verticalAlign: -1, marginRight: 4 }} />{label}
      </label>
      <div className="finput-wrap">
        <input id={id} className="finput" type={show ? 'text' : 'password'} value={value}
          onChange={onChange} autoComplete={autoComplete} style={{ paddingRight: 38 }} required />
        <button type="button" className="fi-toggle" onClick={() => setShow((v) => !v)}
          aria-label={show ? 'Hide password' : 'Show password'} tabIndex={-1}>
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );
}

function ChangePasswordCard({ t }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) { toast.error("New passwords don't match"); return; }
    if (newPassword.length < 8) { toast.error('New password must be at least 8 characters'); return; }

    setBusy(true);
    try {
      await authAPI.changePassword(currentPassword, newPassword);
      toast.success('Password updated');
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not update password');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="card" style={{ padding: 24 }}>
      <div className="card-hd-title" style={{ marginBottom: 4 }}>{t('settings.changePassword', 'Change Password')}</div>
      <p style={{ fontSize: 12.5, color: 'var(--muted)', marginBottom: 18 }}>
        {t('settings.changePasswordDesc', 'Update the password used to sign in to THAAALI.')}
      </p>
      <form onSubmit={onSubmit} style={{ maxWidth: 360 }}>
        <PasswordField id="current-password" label={t('settings.currentPassword', 'Current Password')}
          value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} autoComplete="current-password" />
        <PasswordField id="new-password" label={t('settings.newPassword', 'New Password')}
          value={newPassword} onChange={(e) => setNewPassword(e.target.value)} autoComplete="new-password" />
        <PasswordField id="confirm-new-password" label={t('settings.confirmNewPassword', 'Confirm New Password')}
          value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} autoComplete="new-password" />
        <button type="submit" className="btn btn-pr" disabled={busy} style={{ marginTop: 4 }}>
          {busy ? t('common.loading', 'Loading…') : t('settings.updatePassword', 'Update Password')}
        </button>
      </form>
    </div>
  );
}

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 640 }}>
      <div className="card" style={{ padding: 24 }}>
        <div className="card-hd-title" style={{ marginBottom: 4 }}>{t('chrome.appearance', 'Appearance')}</div>
        <p style={{ fontSize: 12.5, color: 'var(--muted)', marginBottom: 18 }}>
          {t('settings.appearanceDesc', 'Choose how THAAALI looks on this device.')}
        </p>

        <div className="settings-theme-grid" role="group" aria-label={t('chrome.appearance', 'Appearance')}>
          {THEME_OPTIONS.map(({ key, labelKey, label, descKey, desc, Icon }) => (
            <button key={key} type="button"
              className={`settings-theme-card${theme === key ? ' on' : ''}`}
              onClick={() => setTheme(key)}
              aria-pressed={theme === key}>
              <div className="settings-theme-icon"><Icon size={18} /></div>
              <div>
                <div className="settings-theme-lbl">{t(labelKey, label)}</div>
                <div className="settings-theme-desc">{t(descKey, desc)}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="card" style={{ padding: 24 }}>
        <div className="card-hd-title" style={{ marginBottom: 4 }}>{t('chrome.language', 'Language')}</div>
        <p style={{ fontSize: 12.5, color: 'var(--muted)', marginBottom: 18 }}>
          {t('settings.languageDesc', "Pick the language you'd like THAAALI to use. We've pre-selected the one your device is already set to.")}
        </p>

        <div className="fgrp" style={{ marginBottom: 0 }}>
          <label className="flbl" htmlFor="lang-select">
            <Languages size={12} style={{ verticalAlign: -1, marginRight: 4 }} />{t('chrome.language', 'Language')}
          </label>
          <select id="lang-select" className="finput" value={language} onChange={(e) => setLanguage(e.target.value)}>
            {LANGUAGES.map(({ code, label, native }) => (
              <option key={code} value={code}>{native}{native !== label ? ` — ${label}` : ''}</option>
            ))}
          </select>
        </div>
      </div>

      <ChangePasswordCard t={t} />
    </div>
  );
}
