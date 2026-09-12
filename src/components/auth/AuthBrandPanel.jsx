import { motion } from 'framer-motion';
import { UtensilsCrossed, Building2, ShieldCheck, Bot } from 'lucide-react';
import ThaaliMark from '../brand/ThaaliMark';
import thaliHero from '../../assets/landing/thali-hero.jpg';

const FEATURES = [
  { Icon: UtensilsCrossed, text: 'Dine-in · Delivery · WhatsApp · QR ordering' },
  { Icon: Building2, text: 'Restaurant + Hotel on one login' },
  { Icon: ShieldCheck, text: 'GST, UPI & FSSAI built-in' },
  { Icon: Bot, text: 'AI-assisted menu, inventory & reporting' },
];

const ORB = { position: 'absolute', borderRadius: '50%', pointerEvents: 'none' };

export default function AuthBrandPanel() {
  return (
    <div className="login-brand">
      <img className="login-brand-bg" src={thaliHero} alt="" aria-hidden="true" />

      <motion.div style={{ ...ORB, width: 500, height: 500, top: -120, right: -120,
        background: 'radial-gradient(circle,rgba(255,107,0,.14) 0%,transparent 70%)' }}
        animate={{ scale: [1, 1.15, 1], rotate: [0, 8, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }} />
      <motion.div style={{ ...ORB, width: 380, height: 380, bottom: -80, left: -80,
        background: 'radial-gradient(circle,rgba(15,122,69,.12) 0%,transparent 70%)' }}
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 2 }} />
      <motion.div style={{ ...ORB, width: 160, height: 160, top: '40%', left: '10%',
        background: 'radial-gradient(circle,rgba(255,107,0,.08) 0%,transparent 70%)' }}
        animate={{ y: [-20, 20, -20] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }} />

      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
        <motion.div
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 18, delay: 0.1 }}
          style={{
            width: 90, height: 90, margin: '0 auto 24px',
            boxShadow: '0 12px 48px rgba(255,107,0,.4)', borderRadius: '50%',
          }}>
          <ThaaliMark size={90} />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.5 }}
          style={{ fontFamily: 'var(--font-d)', fontSize: 60, fontWeight: 800, color: 'white', letterSpacing: '-2px', lineHeight: 1 }}>
          THAAA<span style={{ color: 'var(--saffron)' }}>LI</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          style={{ color: 'rgba(255,255,255,.42)', fontSize: 15, marginTop: 12, lineHeight: 1.7 }}>
          Restaurant &amp; Hotel Management System<br />
          <em style={{ fontSize: 13, color: 'rgba(255,255,255,.28)' }}>India का अपना Hospitality OS</em>
        </motion.p>

        <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-start' }}>
          {FEATURES.map(({ Icon, text }, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.45 + i * 0.08 }}
              style={{
                fontSize: 12.5, color: 'rgba(255,255,255,.45)',
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'rgba(255,255,255,.04)', padding: '7px 14px', borderRadius: 100,
                border: '1px solid rgba(255,255,255,.07)',
              }}>
              <Icon size={13} style={{ flexShrink: 0 }} />{text}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
