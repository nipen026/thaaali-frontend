import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { UserPlus, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AuthBrandPanel from '../components/auth/AuthBrandPanel';
import { PLANS, BILLING_CYCLES } from '../config/pricing';

export default function SignupPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [form, setForm] = useState({
    businessName: '', businessType: 'both', ownerName: '', email: '', password: '', confirmPassword: '',
  });
  const [busy, setBusy] = useState(false);

  const selectedPlan = useMemo(() => PLANS.find((p) => p.id === params.get('plan')), [params]);
  const billingCycle = params.get('billing') === BILLING_CYCLES.yearly ? BILLING_CYCLES.yearly : BILLING_CYCLES.monthly;

  // Remembered so onboarding/settings can reference the intended plan later — no
  // payment gateway wired up yet, so this is purely a UI acknowledgement for now.
  useEffect(() => {
    if (selectedPlan) {
      localStorage.setItem('thaali_selected_plan', JSON.stringify({ plan: selectedPlan.id, billing: billingCycle }));
    }
  }, [selectedPlan, billingCycle]);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }
    if (form.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    setBusy(true);
    try {
      const u = await register({
        businessName: form.businessName,
        businessType: form.businessType,
        ownerName: form.ownerName,
        email: form.email,
        password: form.password,
      });
      toast.success(`Welcome to THAAALI, ${u.name}!`);
      navigate('/onboarding');
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Could not create your account');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login-shell">
      <AuthBrandPanel />

      <div className="login-form-col">
        <motion.div className="login-box" style={{ maxWidth: 440 }}
          initial={{ opacity: 0, x: 32 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2, duration: 0.5 }}>
          <h2>Create your business account</h2>
          <p className="sub">Set up your restaurant or hotel on THAAALI in a minute</p>

          {selectedPlan && (
            <div className="badge bg-saffron" style={{ marginBottom: 20, padding: '8px 13px', fontSize: 12.5 }}>
              <Sparkles size={13} />
              Signing up for the {selectedPlan.name} plan ({billingCycle === BILLING_CYCLES.yearly ? 'Yearly' : 'Monthly'})
              <Link to="/pricing" style={{ marginLeft: 6, textDecoration: 'underline' }}>Change</Link>
            </div>
          )}

          <form onSubmit={onSubmit}>
            <div className="fgrp">
              <label className="flbl" htmlFor="su-business">Business name</label>
              <input id="su-business" className="finput" value={form.businessName} onChange={set('businessName')}
                placeholder="Spice Route Cafe" required />
            </div>

            <div className="fgrp">
              <label className="flbl" htmlFor="su-type">Business type</label>
              <select id="su-type" className="finput" value={form.businessType} onChange={set('businessType')}>
                <option value="restaurant">Restaurant</option>
                <option value="hotel">Hotel</option>
                <option value="both">Restaurant &amp; Hotel</option>
              </select>
            </div>

            <div className="fgrp">
              <label className="flbl" htmlFor="su-name">Your name</label>
              <input id="su-name" className="finput" value={form.ownerName} onChange={set('ownerName')}
                placeholder="Priya Verma" required />
            </div>

            <div className="fgrp">
              <label className="flbl" htmlFor="su-email">Email</label>
              <input id="su-email" className="finput" type="email" value={form.email} onChange={set('email')}
                placeholder="you@restaurant.in" required />
            </div>

            <div className="grid-2 gap-3">
              <div className="fgrp">
                <label className="flbl" htmlFor="su-password">Password</label>
                <input id="su-password" className="finput" type="password" value={form.password} onChange={set('password')}
                  placeholder="At least 8 characters" required />
              </div>
              <div className="fgrp">
                <label className="flbl" htmlFor="su-confirm">Confirm password</label>
                <input id="su-confirm" className="finput" type="password" value={form.confirmPassword} onChange={set('confirmPassword')}
                  placeholder="••••••••" required />
              </div>
            </div>

            <motion.button type="submit" className="btn btn-pr btn-lg"
              style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} disabled={busy}>
              {busy ? 'Creating your account…' : <><UserPlus size={16} />Create Account</>}
            </motion.button>

            <div style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: 'var(--muted)' }}>
              Already have an account? <Link to="/login" style={{ color: 'var(--saffron-dark)', fontWeight: 700 }}>Sign in</Link>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
