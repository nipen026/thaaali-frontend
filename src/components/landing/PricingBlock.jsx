import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, X, Crown, ArrowRight, Clock } from 'lucide-react';
import { PLANS, ACTIVE_PLANS, COMPARISON, BILLING_CYCLES, planPriceLabel } from '../../config/pricing';

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

export function BillingToggle({ cycle, onChange }) {
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
      <div className={`pricing-card ${plan.popular ? 'popular' : ''} ${plan.comingSoon ? 'coming-soon' : ''}`}>
        {plan.popular && (
          <div className="pricing-popular-tag">
            <Crown size={12} /> Most Popular
          </div>
        )}
        {plan.comingSoon && (
          <div className="pricing-popular-tag pricing-soon-tag">
            <Clock size={12} /> Coming Soon
          </div>
        )}
        <h3>{plan.name}</h3>
        <p className="pricing-card-tagline">{plan.tagline}</p>

        <div className="pricing-card-price">
          <span className="amt">{price.amount}</span>
          <span className="per">{price.period}</span>
        </div>
        <div className="pricing-card-note">{price.note}</div>

        {plan.comingSoon ? (
          <button type="button" className="btn btn-lg btn-sc" disabled style={{ width: '100%', justifyContent: 'center', marginTop: 18 }}>
            {plan.ctaLabel}
          </button>
        ) : (
          <Link to={ctaHref} className={`btn btn-lg ${plan.popular ? 'btn-pr' : 'btn-sc'}`} style={{ width: '100%', justifyContent: 'center', marginTop: 18 }}>
            {plan.ctaLabel} <ArrowRight size={15} />
          </Link>
        )}

        <ul className="pricing-card-features">
          {plan.highlights.map((h) => (
            <li key={h}><Check size={15} /> {h}</li>
          ))}
        </ul>
      </div>
    </Reveal>
  );
}

// All PLANS (active + coming soon) so Hotel still shows up, clearly marked unavailable.
export function PricingCards({ cycle }) {
  return (
    <div className="pricing-grid">
      {PLANS.map((plan, i) => (
        <PlanCard key={plan.id} plan={plan} cycle={cycle} delay={i * 0.06} />
      ))}
    </div>
  );
}

function ComparisonCell({ value }) {
  if (value === true) return <Check size={17} className="cmp-yes" />;
  if (value === false) return <X size={15} className="cmp-no" />;
  return <span className="cmp-text">{value}</span>;
}

// Data-driven off ACTIVE_PLANS so the column count/order always matches the purchasable
// cards above — no hardcoded per-plan columns to keep in sync when a plan is added,
// renamed, or reordered. Hotel is excluded here since it has no shipped features yet.
export function PricingComparisonTable() {
  return (
    <div className="pricing-cmp-wrap">
      <table className="pricing-cmp">
        <thead>
          <tr>
            <th className="cmp-feature-col">Feature</th>
            {ACTIVE_PLANS.map((plan) => (
              <th key={plan.id} className={plan.popular ? 'cmp-popular-col' : ''}>{plan.name}</th>
            ))}
          </tr>
        </thead>
        {COMPARISON.map((group) => (
          <tbody key={group.category}>
            <tr className="cmp-group-row"><td colSpan={ACTIVE_PLANS.length + 1}>{group.category}</td></tr>
            {group.rows.map((row) => (
              <tr key={row.label}>
                <td className="cmp-feature-col">{row.label}</td>
                {ACTIVE_PLANS.map((plan) => (
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
