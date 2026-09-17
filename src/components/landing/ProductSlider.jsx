import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Grid3X3, Monitor, Wallet, TrendingUp, Building2 } from 'lucide-react';

const TABLE_DEMO = [
  { n: 1, s: 'ts-available', l: 'Available' },
  { n: 2, s: 'ts-occupied', l: '4 guests' },
  { n: 3, s: 'ts-bill', l: 'Bill!' },
  { n: 4, s: 'ts-occupied', l: '2 guests' },
  { n: 5, s: 'ts-reserved', l: '7:30 PM' },
  { n: 6, s: 'ts-available', l: 'Available' },
  { n: 7, s: 'ts-occupied', l: '6 guests' },
  { n: 8, s: 'ts-available', l: 'Available' },
];

const KDS_DEMO = [
  { table: 'T4', mins: '2:14', urgent: false, items: ['2× Paneer Tikka', '1× Butter Naan', '3× Dal Makhani'] },
  { table: 'T9', mins: '9:47', urgent: true, items: ['1× Chicken Biryani', '2× Raita'] },
  { table: 'T2', mins: '0:52', urgent: false, items: ['4× Masala Dosa', '2× Filter Coffee'] },
];

const SLIDES = [
  {
    key: 'tables',
    label: 'Floor & Tables',
    Icon: Grid3X3,
    render: () => (
      <div className="showcase-mock">
        <div className="floor-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)', gap: 10, maxWidth: 420, margin: '0 auto' }}>
          {TABLE_DEMO.map((t) => (
            <div key={t.n} className={`tcell ${t.s}`} style={{ fontSize: 12 }}>
              <div className="tcell-num" style={{ fontSize: 16 }}>T{t.n}</div>
              <div className="tcell-sub">{t.l}</div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    key: 'kds',
    label: 'Kitchen Display',
    Icon: Monitor,
    render: () => (
      <div className="showcase-mock">
        <div className="kds-grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', maxWidth: 640, margin: '0 auto' }}>
          {KDS_DEMO.map((o) => (
            <div key={o.table} className="kds-card" style={{ borderLeftColor: o.urgent ? 'var(--crimson)' : 'var(--saffron)' }}>
              <div className="kds-hd" style={{ background: o.urgent ? 'var(--crimson-50)' : 'var(--saffron-50)' }}>
                <span className="kds-table-lbl">{o.table}</span>
                <span className={`kds-time ${o.urgent ? 'urgent' : ''}`}>{o.mins}</span>
              </div>
              <div className="kds-items">
                {o.items.map((it) => (
                  <div className="kds-row" key={it}><span className="kds-name">{it}</span></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    key: 'billing',
    label: 'GST Billing',
    Icon: Wallet,
    render: () => (
      <div className="showcase-mock">
        <div className="bill-summary" style={{ maxWidth: 340, margin: '0 auto', textAlign: 'left' }}>
          <div className="bill-ln"><span>Subtotal</span><span>₹1,240.00</span></div>
          <div className="bill-ln" style={{ color: 'var(--jade)' }}><span>Discount</span><span>−₹100.00</span></div>
          <div className="bill-ln"><span>CGST (2.5%)</span><span>₹28.50</span></div>
          <div className="bill-ln"><span>SGST (2.5%)</span><span>₹28.50</span></div>
          <div className="bill-total"><span>Total</span><span>₹1,197.00</span></div>
          <div className="pay-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
            <div className="pay-btn sel">UPI</div>
            <div className="pay-btn">Card</div>
            <div className="pay-btn">Cash</div>
          </div>
        </div>
      </div>
    ),
  },
  {
    key: 'analytics',
    label: 'Live Analytics',
    Icon: TrendingUp,
    render: () => (
      <div className="showcase-mock">
        <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', maxWidth: 560, margin: '0 auto' }}>
          {[
            { l: "Today's Revenue", v: '₹48,320', d: '+12.4%', up: true },
            { l: 'Orders', v: '186', d: '+8 vs avg', up: true },
            { l: 'Table Turns', v: '2.3×', d: '+0.2', up: true },
            { l: 'Avg Bill', v: '₹520', d: '−1.1%', up: false },
          ].map((k) => (
            <div className="kpi" key={k.l}>
              <div className="kpi-stripe" style={{ background: k.up ? 'var(--jade)' : 'var(--crimson)' }} />
              <div className="kpi-lbl">{k.l}</div>
              <div className="kpi-val">{k.v}</div>
              <div className={`kpi-delta ${k.up ? 'up' : 'dn'}`}>{k.d}</div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    key: 'hotel',
    label: 'Hotel Rooms',
    Icon: Building2,
    render: () => (
      <div className="showcase-mock">
        <div className="room-grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(110px,1fr))', maxWidth: 480, margin: '0 auto' }}>
          {[
            { n: 101, c: 'var(--jade)', t: 'Deluxe', g: 'Vacant' },
            { n: 102, c: 'var(--saffron)', t: 'Deluxe', g: 'A. Shah' },
            { n: 201, c: 'var(--sky)', t: 'Suite', g: 'Reserved' },
            { n: 202, c: 'var(--saffron)', t: 'Suite', g: 'R. Mehta' },
          ].map((r) => (
            <div className="room-card" key={r.n} style={{ borderColor: r.c }}>
              <div className="room-num" style={{ color: r.c }}>#{r.n}</div>
              <div className="room-type-lbl">{r.t}</div>
              <div className="room-guest-name">{r.g}</div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
];

export default function ProductSlider() {
  const [active, setActive] = useState(0);
  const [dir, setDir] = useState(1);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (paused) return undefined;
    timerRef.current = setInterval(() => {
      setDir(1);
      setActive((i) => (i + 1) % SLIDES.length);
    }, 4200);
    return () => clearInterval(timerRef.current);
  }, [paused]);

  const go = (i) => {
    const next = ((i % SLIDES.length) + SLIDES.length) % SLIDES.length;
    setDir(next >= active ? 1 : -1);
    setActive(next);
  };

  return (
    <div
      className="showcase-frame"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="showcase-tabs">
        {SLIDES.map((s, i) => (
          <button
            key={s.key}
            type="button"
            className={`showcase-tab ${i === active ? 'on' : ''}`}
            onClick={() => go(i)}
          >
            <s.Icon size={14} /> {s.label}
          </button>
        ))}
      </div>

      <div className="showcase-screen">
        <button type="button" className="showcase-arrow left" onClick={() => go(active - 1)} aria-label="Previous">
          <ChevronLeft size={18} />
        </button>

        <div className="showcase-chrome">
          <div className="showcase-dots-top">
            <span /><span /><span />
          </div>
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              className="showcase-slide"
              key={SLIDES[active].key}
              custom={dir}
              initial={{ opacity: 0, x: 24 * dir }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 * dir }}
              transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            >
              {SLIDES[active].render()}
            </motion.div>
          </AnimatePresence>
        </div>

        <button type="button" className="showcase-arrow right" onClick={() => go(active + 1)} aria-label="Next">
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="showcase-dots">
        {SLIDES.map((s, i) => (
          <button
            key={s.key}
            type="button"
            className={`showcase-dot ${i === active ? 'on' : ''}`}
            onClick={() => go(i)}
            aria-label={`Go to ${s.label}`}
          />
        ))}
      </div>
    </div>
  );
}
