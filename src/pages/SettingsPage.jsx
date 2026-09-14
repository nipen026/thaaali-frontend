import { Sun, Moon, MonitorSmartphone, Languages } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage, LANGUAGES } from '../context/LanguageContext';

const THEME_OPTIONS = [
  { key: 'light', labelKey: 'chrome.light', label: 'Light', descKey: 'settings.themeLightDesc', desc: 'Always use the light theme', Icon: Sun },
  { key: 'dark', labelKey: 'chrome.dark', label: 'Dark', descKey: 'settings.themeDarkDesc', desc: 'Always use the dark theme', Icon: Moon },
  { key: 'system', labelKey: 'chrome.system', label: 'System', descKey: 'settings.themeSystemDesc', desc: 'Match your device setting', Icon: MonitorSmartphone },
];

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
    </div>
  );
}
