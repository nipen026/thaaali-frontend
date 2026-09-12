import { motion } from 'framer-motion';
import { UtensilsCrossed } from 'lucide-react';

const CHANNEL_LABEL = { zomato: 'Zomato', whatsapp: 'WhatsApp' };

export default function NewOrderToast({ order }) {
  const label = CHANNEL_LABEL[order.channel] || (order.table_id ? `Table ${order.table_number}` : 'Online');
  return (
    <motion.div
      className="card flex gap-3"
      initial={{ opacity: 0, x: 80 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 80 }}
      style={{ padding: '12px 16px', boxShadow: 'var(--sh-lg)', minWidth: 260 }}
    >
      <UtensilsCrossed size={28} style={{ color: 'var(--saffron)', flexShrink: 0 }} />
      <div>
        <div style={{ fontWeight: 700, fontSize: 13 }}>New Order!</div>
        <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{label} · ₹{order.total}</div>
      </div>
      <div style={{ marginLeft: 'auto', width: 8, height: 8, borderRadius: '50%', background: 'var(--jade)', animation: 'pulse-jade 1.5s infinite' }} />
    </motion.div>
  );
}
