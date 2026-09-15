import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, BellRing, Trash2, ClipboardList, PhoneCall } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const ICONS = { order: ClipboardList, call: PhoneCall };

function timeAgo(t, ts) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return t('chrome.justNow', 'Just now');
  const m = Math.floor(s / 60);
  if (m < 60) return t('chrome.minsAgo', '{n}m ago').replace('{n}', m);
  const h = Math.floor(m / 60);
  return t('chrome.hoursAgo', '{n}h ago').replace('{n}', h);
}

export default function NotificationCenter({ notifications, onMarkAllRead, onClear }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const unread = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => { if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const toggle = () => {
    setOpen((o) => {
      const next = !o;
      if (next && unread > 0) onMarkAllRead();
      return next;
    });
  };

  return (
    <div className="notif-center" ref={rootRef}>
      <button type="button" className="tb-btn" onClick={toggle}
        aria-haspopup="menu" aria-expanded={open} aria-label={t('chrome.notifications', 'Notifications')}>
        <Bell size={17} />
        {unread > 0 && <div className="tb-notif-dot" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div className="notif-panel" role="menu"
            initial={{ opacity: 0, y: -6, scale: .97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: .97 }}
            transition={{ duration: .16, ease: [.16, 1, .3, 1] }}>
            <div className="notif-panel-hd">
              <span>{t('chrome.notifications', 'Notifications')}</span>
              {notifications.length > 0 && (
                <button type="button" className="notif-clear-btn" onClick={onClear}>
                  <Trash2 size={12} /> {t('chrome.clearAll', 'Clear all')}
                </button>
              )}
            </div>

            {notifications.length === 0 ? (
              <div className="notif-empty">
                <BellRing size={26} />
                <p>{t('chrome.noNotifications', "You're all caught up")}</p>
              </div>
            ) : (
              <div className="notif-list">
                {notifications.map((n) => {
                  const Icon = ICONS[n.type] || Bell;
                  return (
                    <div key={n.id} className={`notif-item${n.read ? '' : ' unread'}`} role="menuitem">
                      <div className="notif-item-ico"><Icon size={14} /></div>
                      <div style={{ minWidth: 0 }}>
                        <div className="notif-item-msg">{n.message}</div>
                        <div className="notif-item-time">{timeAgo(t, n.time)}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
