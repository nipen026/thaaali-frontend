import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Check, X, Crown, ArrowRight, Menu as MenuIcon, ChevronDown, Sparkles,
} from 'lucide-react';
import { useDocumentHead } from '../lib/useDocumentHead';
import logoLockup from '../assets/brand/logo-lockup.png';
import { PLANS, COMPARISON, PRICING_FAQS, BILLING_CYCLES, planPriceLabel } from '../config/pricing';

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

function BillingToggle({ cycle, onChange }) {
  const isYearly = cycle === BILLING_CYCLES.yearly;
  return (
    <div className="pricing-toggle" role="tablist" aria-label="Billing cycle">
      <button
        type="button"
        role="tab"
        aria-selected={!isYearly}
        className={`pricing-toggle-opt ${!isYearly ? 'on' : ''}`}
        onClick={() => onChange(BILLING_CYCLES.monthly)}
      >
        Monthly
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={isYearly}
        className={`pricing-toggle-opt ${isYearly ? 'on' : ''}`}
        onClick={() => onChange(BILLING_CYCLES.yearly)}
      >
        Yearly <span className="pricing-toggle-save">Save 17%</span>
      </button>
    </div>
  );
}

function PlanCard({ plan, cycle, delay }) {
  const price = planPriceLabel(plan, cycle);
  const ctaHref = `/signup?plan=${plan.id}&billing=${cycle}`;

  return (
    <Reveal delay={delay}>
      <div className={`pricing-card ${plan.popular ? 'popular' : ''}`}>
        {plan.popular && (
          <div className="pricing-popular-tag">
            <Crown size={12} /> Most Popular
          </div>
        )}
        <h3>{plan.name}</h3>
        <p className="pricing-card-tagline">{plan.tagline}</p>

        <div className="pricing-card-price">
          <span className="amt">{price.amount}</span>
          <span className="per">{price.period}</span>
        </div>
        <div className="pricing-card-note">{price.note}</div>

        <Link to={ctaHref} className={`btn btn-lg ${plan.popular ? 'btn-pr' : 'btn-sc'}`} style={{ width: '100%', justifyContent: 'center', marginTop: 18 }}>
          {plan.ctaLabel} <ArrowRight size={15} />
        </Link>

        <ul className="pricing-card-features">
          {plan.highlights.map((h) => (
            <li key={h}><Check size={15} /> {h}</li>
          ))}
        </ul>
      </div>
    </Reveal>
  );
}

function ComparisonCell({ value }) {
  if (value === true) return <Check size={17} className="cmp-yes" />;
  if (value === false) return <X size={15} className="cmp-no" />;
  return <span className="cmp-text">{value}</span>;
}

// Data-driven off PLANS so the column count/order always matches the cards above — no
// hardcoded per-plan columns to keep in sync when a plan is added, renamed, or reordered.
function ComparisonTable() {
  return (
    <div className="pricing-cmp-wrap">
      <table className="pricing-cmp">
        <thead>
          <tr>
            <th className="cmp-feature-col">Feature</th>
            {PLANS.map((plan) => (
              <th key={plan.id} className={plan.popular ? 'cmp-popular-col' : ''}>{plan.name}</th>
            ))}
          </tr>
        </thead>
        {COMPARISON.map((group) => (
          <tbody key={group.category}>
            <tr className="cmp-group-row"><td colSpan={PLANS.length + 1}>{group.category}</td></tr>
            {group.rows.map((row) => (
              <tr key={row.label}>
                <td className="cmp-feature-col">{row.label}</td>
                {PLANS.map((plan) => (
                  <td key={plan.id} className={plan.popular ? 'cmp-popular-col' : ''}><ComparisonCell value={row[plan.id]} /></td>
                ))}
              </tr>
            ))}
          </tbody>
        ))}
      </table>
    </div>
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
    description: 'Affordable, transparent pricing for Indian cafes, restaurants, and hotels. Plans built for your business — Cafe, Restaurant, Hotel, or both — monthly or yearly, no credit card required to start.',
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
            No hidden fees, no per-transaction cuts. Pick the plan built for your business —
            Cafe, Restaurant, Hotel, or both. 14-day free trial, no card required.
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <div style={{ marginTop: 30, display: 'flex', justifyContent: 'center' }}>
            <BillingToggle cycle={cycle} onChange={setCycle} />
          </div>
        </Reveal>
      </section>

      <section className="landing-section" style={{ paddingTop: 44 }}>
        <div className="pricing-grid">
          {PLANS.map((plan, i) => (
            <PlanCard key={plan.id} plan={plan} cycle={cycle} delay={i * 0.06} />
          ))}
        </div>
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
          <ComparisonTable />
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
