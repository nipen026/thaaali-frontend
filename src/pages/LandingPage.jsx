import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Grid3X3, ClipboardList, Monitor, Wallet, Package, TrendingUp, Building2, Users,
  Crown, Briefcase, Utensils, CreditCard, ChefHat, ArrowRight, Menu, X,
  ShieldCheck, Zap, Layers, UserPlus, Settings2, Rocket, Sparkles, CheckCircle2,
} from 'lucide-react';
import { useDocumentHead } from '../lib/useDocumentHead';
import ProductSlider from '../components/landing/ProductSlider';
import FAQAccordion from '../components/landing/FAQAccordion';
import ThaaliMark from '../components/brand/ThaaliMark';
import thaliHero from '../assets/landing/thali-hero.jpg';
import thaliFoodTable from '../assets/landing/thali-food-table.jpg';
import restaurantAmbient from '../assets/landing/restaurant-ambient.jpg';
import hotelLobby from '../assets/landing/hotel-lobby.jpg';

const STRUCTURED_DATA = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'THAAALI',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  description: 'All-in-one restaurant and hotel management platform covering tables, orders, kitchen display, GST-ready billing, inventory, and hotel operations.',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
};

const NAV_LINKS = [
  { href: '#features', label: 'Features' },
  { href: '#product', label: 'Product' },
  { href: '#roles', label: 'Teams' },
  { href: '#faq', label: 'FAQ' },
];

const FEATURES = [
  { Icon: Grid3X3, title: 'Floor & Table Management', desc: 'Live floor plan with real-time table status, seating, and reservations.' },
  { Icon: ClipboardList, title: 'Multi-Channel Orders', desc: 'Dine-in, takeaway, and delivery orders in one unified queue.' },
  { Icon: Monitor, title: 'Kitchen Display System', desc: 'Real-time KOT updates for the kitchen, synced instantly with the floor.' },
  { Icon: Wallet, title: 'Billing & GST', desc: 'GST-ready billing with split payments, discounts, and UPI/card/cash.' },
  { Icon: Package, title: 'Inventory Tracking', desc: 'Stock levels, reorder alerts, and consumption history in one place.' },
  { Icon: Building2, title: 'Hotel Management', desc: 'Rooms, reservations, check-in/out, and housekeeping alongside your restaurant.' },
  { Icon: Users, title: 'Role-Based Staff Access', desc: 'Every role — waiter, kitchen, cashier, manager — sees only what they need.' },
  { Icon: TrendingUp, title: 'Live Analytics', desc: 'Revenue, occupancy, and top-selling items updated in real time.' },
];

const HIGHLIGHTS = [
  { Icon: Zap, label: 'Real-time sync', sub: 'Floor, kitchen & billing' },
  { Icon: ShieldCheck, label: 'GST-ready', sub: 'Built for Indian tax rules' },
  { Icon: Layers, label: 'One login', sub: 'Restaurant + hotel together' },
];

const STATS = [
  { to: 8, suffix: '+', label: 'Core modules' },
  { to: 6, suffix: '', label: 'Staff roles' },
  { to: 100, suffix: '%', label: 'GST-ready billing' },
  { to: 1, suffix: '', label: 'Login for everything' },
];

const STEPS = [
  { Icon: UserPlus, title: 'Create your account', desc: 'Sign up in minutes — no credit card required to get started.' },
  { Icon: Settings2, title: 'Set up your business', desc: 'Add your tables or rooms, build your menu, and invite your team.' },
  { Icon: Rocket, title: 'Start serving', desc: 'Take orders, fire the kitchen, bill guests, and watch it all sync live.' },
];

const ROLES = [
  { Icon: Crown, label: 'Owner', desc: 'Full control across every location and module.' },
  { Icon: Briefcase, label: 'Manager', desc: 'Day-to-day operations, staff, and reporting.' },
  { Icon: Utensils, label: 'Waiter', desc: 'Fast table view and order entry on the floor.' },
  { Icon: CreditCard, label: 'Cashier', desc: 'Billing, split payments, and daily settlement.' },
  { Icon: ChefHat, label: 'Kitchen', desc: 'Live KOT queue with prep-time alerts.' },
  { Icon: Building2, label: 'Hotel Desk', desc: 'Rooms, check-in/out, and housekeeping.' },
];

const EASE = [0.16, 1, 0.3, 1];

function Reveal({ children, delay = 0, y = 22, style }) {
  return (
    <motion.div
      style={style}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.55, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

function CountUp({ to, suffix = '', duration = 1.3 }) {
  const ref = useRef(null);
  const started = useRef(false);
  const [val, setVal] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const obs = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || started.current) return;
      started.current = true;
      const start = performance.now();
      const tick = (now) => {
        const p = Math.min((now - start) / (duration * 1000), 1);
        const eased = 1 - (1 - p) ** 3;
        setVal(Math.round(to * eased));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.4 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [to, duration]);

  return <span ref={ref}>{val}{suffix}</span>;
}

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  useDocumentHead({
    title: 'THAAALI — Your Whole Business, Served on One Thaaali',
    description: 'All-in-one restaurant and hotel management platform: tables, orders, kitchen display, GST-ready billing, inventory, and hotel operations in one login.',
  });

  return (
    <div className="landing">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(STRUCTURED_DATA) }} />

      <nav className="landing-nav">
        <div className="landing-brand">
          <div className="sb-mark" style={{ width: 34, height: 34 }}><ThaaliMark size={34} /></div>
          <div style={{ fontFamily: 'var(--font-d)', fontWeight: 800, fontSize: 17, color: 'var(--ink)' }}>
            THAAA<span style={{ color: 'var(--saffron)' }}>LI</span>
          </div>
        </div>

        <div className="landing-nav-links">
          {NAV_LINKS.map((l) => (
            <a key={l.href} href={l.href} className="landing-nav-link">{l.label}</a>
          ))}
        </div>

        <div className="flex gap-3">
          <Link to="/login" className="btn btn-gh landing-nav-desktop-only">Sign In</Link>
          <Link to="/signup" className="btn btn-pr">Get Started</Link>
          <button
            type="button"
            className="landing-mobile-toggle"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {menuOpen && (
          <div className="landing-mobile-menu">
            {NAV_LINKS.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)}>{l.label}</a>
            ))}
            <Link to="/login" onClick={() => setMenuOpen(false)}>Sign In</Link>
          </div>
        )}
      </nav>

      <header className="landing-hero">
        <div className="landing-hero-glow" />
        <div className="landing-hero-inner">
          <div className="landing-hero-copy">
            <motion.div className="landing-badge" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <Sparkles size={13} /> One Thaaali. Everything Served.
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.05 }}>
              Your whole business, served on one Thaaali.
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }}>
              Tables, orders, kitchen, billing, inventory, and hotel operations — plated together
              on one platform, built for how your team actually works.
            </motion.p>
            <motion.div className="landing-hero-cta" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.25 }}>
              <Link to="/signup" className="btn btn-pr btn-lg">
                Start Free <ArrowRight size={16} />
              </Link>
              <a href="#product" className="btn btn-sc btn-lg" style={{ background: 'rgba(255,255,255,.08)', color: 'white', borderColor: 'rgba(255,255,255,.18)' }}>
                See it in action
              </a>
            </motion.div>

            <motion.div className="landing-hero-stats" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.35 }}>
              {HIGHLIGHTS.map(({ Icon, label, sub }) => (
                <div className="landing-hero-stat" key={label}>
                  <Icon size={17} />
                  <div>
                    <div className="landing-hero-stat-lbl">{label}</div>
                    <div className="landing-hero-stat-sub">{sub}</div>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          <motion.div
            className="landing-hero-visual"
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.15, ease: EASE }}
          >
            <div className="hero-visual-frame">
              <img src={thaliHero} alt="A traditional Indian thali — the everything-served-together platter THAAALI is named for" loading="eager" />
            </div>
            <div className="hero-float-card hero-float-1">
              <div className="hfc-ico" style={{ background: 'var(--jade-50)', color: 'var(--jade)' }}><CheckCircle2 size={15} /></div>
              <div>
                <div>Bill settled</div>
                <div className="hfc-sub">₹1,197 · UPI</div>
              </div>
            </div>
            <div className="hero-float-card hero-float-2">
              <div className="hfc-ico" style={{ background: 'var(--saffron-50)', color: 'var(--saffron-dark)' }}><Zap size={15} /></div>
              <div>
                <div>KOT fired</div>
                <div className="hfc-sub">Table T4 · 12s ago</div>
              </div>
            </div>
            <div className="hero-float-card hero-float-3">
              <div className="hfc-ico" style={{ background: 'var(--sky-50)', color: 'var(--sky)' }}><TrendingUp size={15} /></div>
              <div>
                <div>Today&rsquo;s revenue</div>
                <div className="hfc-sub">+12.4% vs avg</div>
              </div>
            </div>
          </motion.div>
        </div>
      </header>

      <section className="landing-stats-band">
        <div className="landing-stats-inner">
          {STATS.map((s) => (
            <div key={s.label}>
              <div className="landing-stat-num"><CountUp to={s.to} suffix={s.suffix} /></div>
              <div className="landing-stat-lbl">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="landing-section" id="features">
        <Reveal>
          <div className="landing-section-hd">
            <span className="landing-kicker">One Thaaali. Every Course Covered.</span>
            <h2>Everything your operation needs</h2>
            <p>
              THAAALI brings restaurant management and hotel management into one platform —
              built for the full lifecycle of an Indian hospitality business, from the first
              table you seat to the last room you check out, in one login.
            </p>
          </div>
        </Reveal>
        <div className="landing-feature-grid">
          {FEATURES.map(({ Icon, title, desc }, i) => (
            <Reveal delay={Math.min(i, 4) * 0.05} key={title}>
              <div className="landing-feature">
                <div className="landing-feature-icon"><Icon size={22} /></div>
                <h3>{title}</h3>
                <p>{desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="landing-section" style={{ paddingTop: 0 }}>
        <Reveal>
          <div className="landing-section-hd">
            <span className="landing-kicker">Two Businesses, One Plate</span>
            <h2>Whichever you run, THAAALI plates it together</h2>
            <p>Restaurant-only, hotel-only, or both — the same login covers whichever business you run.</p>
          </div>
        </Reveal>
        <div className="landing-split-grid">
          <Reveal>
            <div className="landing-split-card">
              <img src={thaliFoodTable} alt="Restaurant dining table with an Indian thali" loading="lazy" />
              <div className="landing-split-overlay">
                <div className="sp-ico"><Utensils size={19} /></div>
                <h3>Restaurant</h3>
                <p>Tables, orders, kitchen, and billing — served live from floor to bill.</p>
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <div className="landing-split-card">
              <img src={hotelLobby} alt="Elegant hotel lobby" loading="lazy" />
              <div className="landing-split-overlay">
                <div className="sp-ico"><Building2 size={19} /></div>
                <h3>Hotel</h3>
                <p>Rooms, reservations, and housekeeping — on the very same plate.</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="landing-section landing-showcase-section" id="product">
        <Reveal>
          <div className="landing-section-hd">
            <span className="landing-kicker">See It Live</span>
            <h2>One screen for every part of the job</h2>
            <p>A live look at the floor, the kitchen, the bill, and the numbers — switch between modules below.</p>
          </div>
        </Reveal>
        <Reveal delay={0.08}>
          <ProductSlider />
        </Reveal>
      </section>

      <section className="landing-section" style={{ paddingTop: 0 }}>
        <Reveal>
          <div className="landing-section-hd">
            <span className="landing-kicker">Getting Started</span>
            <h2>Up and running in three steps</h2>
            <p>No hardware to buy, no long onboarding calls — get your team on THAAALI the same day.</p>
          </div>
        </Reveal>
        <div className="landing-steps">
          {STEPS.map(({ Icon, title, desc }, i) => (
            <Reveal delay={i * 0.08} key={title}>
              <div className="landing-step">
                <div className="landing-step-num">{String(i + 1).padStart(2, '0')}</div>
                <div className="landing-step-icon"><Icon size={20} /></div>
                <h3>{title}</h3>
                <p>{desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="landing-section" id="roles" style={{ paddingTop: 0 }}>
        <Reveal>
          <div className="landing-section-hd">
            <span className="landing-kicker">One Team, Every Role</span>
            <h2>Built for every role on your team</h2>
            <p>Each person sees a simple, focused view for exactly their job.</p>
          </div>
        </Reveal>
        <div className="landing-role-grid">
          {ROLES.map(({ Icon, label, desc }, i) => (
            <Reveal delay={Math.min(i, 4) * 0.05} key={label}>
              <div className="landing-role-card">
                <div className="landing-role-icon"><Icon size={20} /></div>
                <div className="landing-role-lbl">{label}</div>
                <p>{desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="landing-section" id="faq" style={{ paddingTop: 0, maxWidth: 820 }}>
        <Reveal>
          <div className="landing-section-hd">
            <span className="landing-kicker">Questions</span>
            <h2>Frequently asked questions</h2>
            <p>Everything you need to know before you switch your team over.</p>
          </div>
        </Reveal>
        <Reveal delay={0.06}>
          <FAQAccordion />
        </Reveal>
      </section>

      <section className="landing-cta-band">
        <img className="landing-cta-bg" src={restaurantAmbient} alt="" aria-hidden="true" loading="lazy" />
        <Reveal>
          <h2>Ready to run your business on THAAALI?</h2>
          <p>Set up your restaurant or hotel in minutes — no credit card required.</p>
          <Link to="/signup" className="btn btn-lg" style={{ background: 'white', color: 'var(--saffron-dark)' }}>
            Create your account <ArrowRight size={16} />
          </Link>
        </Reveal>
      </section>

      <footer className="landing-footer">
        <div className="landing-footer-grid">
          <div className="landing-footer-brand">
            <div className="landing-brand">
              <div className="sb-mark" style={{ width: 30, height: 30 }}><ThaaliMark size={30} /></div>
              <div style={{ fontFamily: 'var(--font-d)', fontWeight: 800, fontSize: 15, color: 'var(--ink)' }}>
                THAAA<span style={{ color: 'var(--saffron)' }}>LI</span>
              </div>
            </div>
            <p>Your whole business, served on one Thaaali.</p>
          </div>
          <div className="landing-footer-col">
            <h4>Product</h4>
            <a href="#features">Features</a>
            <a href="#product">Product tour</a>
            <a href="#roles">Teams</a>
          </div>
          <div className="landing-footer-col">
            <h4>Get started</h4>
            <Link to="/signup">Create account</Link>
            <Link to="/login">Sign in</Link>
            <a href="#faq">FAQ</a>
          </div>
        </div>
        <div className="landing-footer-bottom">
          THAAALI &mdash; Restaurant &amp; Hotel Management System
        </div>
      </footer>
    </div>
  );
}
