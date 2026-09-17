import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu as MenuIcon, ChevronDown, Sparkles } from 'lucide-react';
import { useDocumentHead } from '../lib/useDocumentHead';
import logoLockup from '../assets/brand/logo-lockup.png';
import { PRICING_FAQS, BILLING_CYCLES } from '../config/pricing';
import { BillingToggle, PricingCards, PricingComparisonTable } from '../components/landing/PricingBlock';

const PRICING_FAQ_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: PRICING_FAQS.map(({ q, a }) => ({
    '@type': 'Question',
    name: q,
    acceptedAnswer: { '@type': 'Answer', text: a },
  })),
};

const EASE = [0.16, 1, 0.3, 1];

function Reveal({ children, delay = 0, y = 22 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.55, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

function PricingFAQ() {
  const [open, setOpen] = useState(0);
  return (
    <div className="landing-faq">
      {PRICING_FAQS.map((item, i) => {
        const isOpen = open === i;
        return (
          <div className={`faq-item ${isOpen ? 'on' : ''}`} key={item.q}>
            <button type="button" className="faq-q" onClick={() => setOpen(isOpen ? -1 : i)} aria-expanded={isOpen}>
              <span>{item.q}</span>
              <ChevronDown size={18} className="faq-chev" />
            </button>
            <div className="faq-a-wrap" style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}>
              <div className="faq-a"><p>{item.a}</p></div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function PricingPage() {
  const [cycle, setCycle] = useState(BILLING_CYCLES.yearly);
  const [menuOpen, setMenuOpen] = useState(false);

  useDocumentHead({
    title: 'Pricing — THAAALI',
    description: 'Affordable, transparent pricing for Indian restaurants — Starter, Growth, or Pro — monthly or yearly, no credit card required to start. Hotel management coming soon.',
    path: '/pricing',
    jsonLd: PRICING_FAQ_SCHEMA,
  });

  return (
    <div className="landing">
      <nav className="landing-nav">
        <Link to="/" className="landing-brand">
          <img src={logoLockup} alt="THAAALI" style={{ height: 32 }} />
        </Link>

        <div className="landing-nav-links">
          <Link to="/#features" className="landing-nav-link">Features</Link>
          <Link to="/pricing" className="landing-nav-link" aria-current="page">Pricing</Link>
          <Link to="/#faq" className="landing-nav-link">FAQ</Link>
        </div>

        <div className="flex gap-3">
          <Link to="/login" className="btn btn-gh landing-nav-desktop-only">Sign In</Link>
          <Link to="/signup" className="btn btn-pr">Get Started</Link>
          <button type="button" className="landing-mobile-toggle" onClick={() => setMenuOpen((v) => !v)} aria-label="Toggle menu">
            <MenuIcon size={20} />
          </button>
        </div>

        {menuOpen && (
          <div className="landing-mobile-menu">
            <Link to="/#features" onClick={() => setMenuOpen(false)}>Features</Link>
            <Link to="/pricing" onClick={() => setMenuOpen(false)}>Pricing</Link>
            <Link to="/#faq" onClick={() => setMenuOpen(false)}>FAQ</Link>
            <Link to="/login" onClick={() => setMenuOpen(false)}>Sign In</Link>
          </div>
        )}
      </nav>

      <section className="landing-section" style={{ paddingBottom: 0, textAlign: 'center' }}>
        <Reveal>
          <div className="landing-badge" style={{ margin: '0 auto 18px', background: 'var(--saffron-50)', color: 'var(--saffron-dark)' }}>
            <Sparkles size={13} /> Simple, transparent pricing
          </div>
          <h1 style={{ fontFamily: 'var(--font-d)', fontSize: 'clamp(28px,4vw,44px)', fontWeight: 800, letterSpacing: '-.5px', color: 'var(--ink)' }}>
            Priced for Indian businesses, not enterprise budgets
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: 15.5, maxWidth: 560, margin: '14px auto 0' }}>
            No hidden fees, no per-transaction cuts. Pick the plan built for your restaurant —
            Starter, Growth, or Pro. 14-day free trial, no card required.
            <br />
            <span style={{ fontSize: 13, opacity: 0.85 }}>Hotel management is coming soon.</span>
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <div style={{ marginTop: 30, display: 'flex', justifyContent: 'center' }}>
            <BillingToggle cycle={cycle} onChange={setCycle} />
          </div>
        </Reveal>
      </section>

      <section className="landing-section" style={{ paddingTop: 44 }}>
        <PricingCards cycle={cycle} />
        <Reveal delay={0.3}>
          <p style={{ textAlign: 'center', color: 'var(--muted)', fontSize: 13.5, marginTop: 28 }}>
            Running multiple locations or a larger group?{' '}
            <a href="mailto:sales@thaaali.app?subject=Multi-location%20plan%20enquiry" style={{ color: 'var(--saffron-dark)', fontWeight: 700 }}>
              Talk to us for a custom quote
            </a>
          </p>
        </Reveal>
      </section>

      <section className="landing-section" style={{ paddingTop: 0 }}>
        <Reveal>
          <div className="landing-section-hd">
            <span className="landing-kicker">Compare Plans</span>
            <h2>Every detail, laid out plainly</h2>
            <p>Exactly what's included at each tier — no fine print.</p>
          </div>
        </Reveal>
        <Reveal delay={0.08}>
          <PricingComparisonTable />
        </Reveal>
      </section>

      <section className="landing-section" id="faq" style={{ paddingTop: 0, maxWidth: 820 }}>
        <Reveal>
          <div className="landing-section-hd">
            <span className="landing-kicker">Questions</span>
            <h2>Pricing FAQ</h2>
          </div>
        </Reveal>
        <Reveal delay={0.06}>
          <PricingFAQ />
        </Reveal>
      </section>

      <footer className="landing-footer">
        <div className="landing-footer-bottom" style={{ padding: '32px 0 40px' }}>
          THAAALI &mdash; Restaurant &amp; Hotel Management System
        </div>
      </footer>
    </div>
  );
}
