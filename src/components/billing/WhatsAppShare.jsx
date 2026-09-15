import { useState } from 'react';
import { MessageCircle, Send, X } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { formatQty } from '../../lib/formatQty';

// wa.me click-to-chat deep link — no WhatsApp Business API is configured (that needs a paid
// Meta setup), so this pre-fills a message and hands off to WhatsApp itself; the cashier still
// taps send. Indian numbers only (91 country code), matching the app's INR/India-first scope.
function buildMessage(bill, tenantName) {
  const created = new Date(bill.created_at);
  const lines = [
    `*${tenantName}*`,
    `Bill #${bill.bill_number}`,
    `${created.toLocaleDateString('en-IN')} · ${created.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`,
    '',
    ...bill.items.map((it) => `${it.name} ${formatQty(it.qty, it.unit)} — ₹${(it.price * it.qty).toFixed(2)}`),
    '',
    `Subtotal: ₹${Number(bill.subtotal).toFixed(2)}`,
    bill.discount > 0 ? `Discount: −₹${Number(bill.discount).toFixed(2)}` : null,
    `CGST: ₹${Number(bill.cgst).toFixed(2)}`,
    `SGST: ₹${Number(bill.sgst).toFixed(2)}`,
    `*Total: ₹${Number(bill.grand_total).toFixed(2)}*`,
    '',
    'Thank you for dining with us!',
  ].filter((l) => l !== null);
  return lines.join('\n');
}

function openWhatsApp(digits, bill, tenantName) {
  window.open(`https://wa.me/91${digits}?text=${encodeURIComponent(buildMessage(bill, tenantName))}`, '_blank');
}

// `phone` is the number already captured on the order (see TablesPage.jsx) — when present, this
// sends immediately with no extra prompt, per the requirement that the customer's phone must not
// be asked for again at payment time. The manual-entry fallback only appears for older bills/
// orders that never captured one.
export default function WhatsAppShare({ bill, tenantName, phone, compact }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [manualPhone, setManualPhone] = useState('');
  const capturedDigits = (phone || '').replace(/\D/g, '');
  const hasCapturedPhone = capturedDigits.length === 10;
  const manualDigits = manualPhone.replace(/\D/g, '');
  const manualValid = manualDigits.length === 10;

  const sendCaptured = () => openWhatsApp(capturedDigits, bill, tenantName);
  const sendManual = () => {
    if (!manualValid) return;
    openWhatsApp(manualDigits, bill, tenantName);
    setOpen(false);
    setManualPhone('');
  };

  if (open) {
    return (
      <div className="wa-share-row">
        <input
          type="tel" className="finput" placeholder={t('billing.waPhonePlaceholder', '10-digit phone number')}
          value={manualPhone} onChange={(e) => setManualPhone(e.target.value)} maxLength={10} autoFocus
          onKeyDown={(e) => { if (e.key === 'Enter') sendManual(); if (e.key === 'Escape') setOpen(false); }}
        />
        <button type="button" className="btn btn-su btn-sm" disabled={!manualValid} onClick={sendManual} aria-label={t('billing.waSend', 'Send')}>
          <Send size={14} />
        </button>
        <button type="button" className="btn btn-gh btn-sm" onClick={() => setOpen(false)} aria-label={t('common.cancel', 'Cancel')}>
          <X size={14} />
        </button>
      </div>
    );
  }

  const onClick = hasCapturedPhone ? sendCaptured : () => setOpen(true);
  const label = hasCapturedPhone
    ? t('billing.sendWhatsappTo', 'Send via WhatsApp ({phone})').replace('{phone}', phone)
    : t('billing.sendWhatsapp', 'Send via WhatsApp');

  if (compact) {
    return (
      <button type="button" className="tb-btn" style={{ width: 30, height: 30 }} onClick={onClick} aria-label={label}>
        <MessageCircle size={14} />
      </button>
    );
  }

  return (
    <button type="button" className="btn btn-sc" onClick={onClick}>
      <MessageCircle size={15} /> {label}
    </button>
  );
}
