import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { User, Settings, LogOut, Sun, Moon, MonitorSmartphone, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

const THEME_OPTIONS = [
  { key: 'light', labelKey: 'chrome.light', label: 'Light', Icon: Sun },
  { key: 'dark', labelKey: 'chrome.dark', label: 'Dark', Icon: Moon },
  { key: 'system', labelKey: 'chrome.system', label: 'System', Icon: MonitorSmartphone },
];

export default function UserMenu() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const nav = useNavigate();

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => { if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const go = (path) => { setOpen(false); nav(path); };

  return (
    <div className="user-menu" ref={rootRef}>
      <button type="button" className="tb-user-chip" onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu" aria-expanded={open}>
        <div className="sb-av" style={{ width: 26, height: 26, fontSize: 10 }}>{user.avatar}</div>
        <span>{user.name.split(' ')[0]}</span>
        <ChevronDown size={13} className={`user-menu-chev${open ? ' open' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div className="user-menu-panel" role="menu"
            initial={{ opacity: 0, y: -6, scale: .97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: .97 }}
            transition={{ duration: .16, ease: [.16, 1, .3, 1] }}>

            <div className="user-menu-hd">
              <div className="sb-av" style={{ width: 36, height: 36, fontSize: 13 }}>{user.avatar}</div>
              <div className="user-menu-hd-txt">
                <div className="user-menu-name">{user.name}</div>
                <div className="user-menu-email">{user.email}</div>
              </div>
            </div>

            <div className="user-menu-sep" />

            <button type="button" className="user-menu-item" role="menuitem" onClick={() => go('/app/profile')}>
              <User size={15} /> {t('common.profile', 'Profile')}
            </button>
            <button type="button" className="user-menu-item" role="menuitem" onClick={() => go('/app/settings')}>
              <Settings size={15} /> {t('common.settings', 'Settings')}
            </button>

            <div className="user-menu-sep" />

            <div className="user-menu-theme-lbl">{t('chrome.appearance', 'Appearance')}</div>
            <div className="user-menu-theme-row" role="group" aria-label={t('chrome.appearance', 'Appearance')}>
              {THEME_OPTIONS.map(({ key, labelKey, label, Icon }) => (
                <button key={key} type="button"
                  className={`user-menu-theme-btn${theme === key ? ' on' : ''}`}
                  onClick={() => setTheme(key)}
                  aria-pressed={theme === key}>
                  <Icon size={14} />
                  {t(labelKey, label)}
                </button>
              ))}
            </div>

            <div className="user-menu-sep" />

            <button type="button" className="user-menu-item danger" role="menuitem" onClick={logout}>
              <LogOut size={15} /> {t('common.signOut', 'Sign Out')}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
