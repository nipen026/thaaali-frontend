import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Printer, FileText, Receipt as ReceiptIcon } from 'lucide-react';
import { billingAPI, tenantAPI } from '../api';
import { useDocumentHead } from '../lib/useDocumentHead';
import { formatQty } from '../lib/formatQty';

const PAY_LABEL = { upi: 'UPI', card: 'Card', cash: 'Cash', mixed: 'Split Payment' };

function money(n) { return `₹${Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`; }

// Injects a dynamic @page rule rather than relying on CSS named-page selectors (inconsistent
// browser support) — this is what actually controls paper size/margins in the print dialog,
// separate from the on-screen layout width driven by the .fmt-a4/.fmt-thermal classes below.
function usePageFormat(format) {
  useEffect(() => {
    let el = document.getElementById('dynamic-page-rule');
    if (!el) {
      el = document.createElement('style');
      el.id = 'dynamic-page-rule';
      document.head.appendChild(el);
    }
    el.textContent = format === 'thermal'
      ? '@page { size: 80mm auto; margin: 4mm; }'
      : '@page { size: A4; margin: 16mm; }';
    return () => { el.remove(); };
  }, [format]);
}

export default function PrintBillPage() {
  const { id } = useParams();
  const [bill, setBill] = useState(null);
  const [tenant, setTenant] = useState(null);
  const [error, setError] = useState(null);
  const [format, setFormat] = useState('a4');

  usePageFormat(format);
  useDocumentHead({ title: bill ? `Bill #${bill.bill_number} — THAAALI` : 'Bill — THAAALI' });

  useEffect(() => {
    Promise.all([billingAPI.getById(id), tenantAPI.get()])
      .then(([b, t]) => { setBill(b.data); setTenant(t.data); })
      .catch(() => setError('Could not load this bill.'));
  }, [id]);

  if (error) return <div className="print-page-shell"><div className="print-error">{error}</div></div>;
  if (!bill || !tenant) return <div className="print-page-shell"><div className="print-loading">Loading bill…</div></div>;

  const created = new Date(bill.created_at);

  return (
    <div className="print-page-shell">
      <div className="print-controls">
        <div className="print-fmt-toggle">
          <button type="button" className={format === 'a4' ? 'on' : ''} onClick={() => setFormat('a4')}>
            <FileText size={14} /> A4 Invoice
          </button>
          <button type="button" className={format === 'thermal' ? 'on' : ''} onClick={() => setFormat('thermal')}>
            <ReceiptIcon size={14} /> Thermal Receipt (80mm)
          </button>
        </div>
        <button type="button" className="print-go-btn" onClick={() => window.print()}>
          <Printer size={15} /> Print
        </button>
      </div>

      <div className={`print-invoice fmt-${format}`}>
        <div className="pi-header">
          <div className="pi-biz-name">{tenant.name}</div>
          {tenant.address && <div className="pi-biz-line">{tenant.address}</div>}
          {tenant.phone && <div className="pi-biz-line">Ph: {tenant.phone}</div>}
          {tenant.gstin && <div className="pi-biz-line">GSTIN: {tenant.gstin}</div>}
        </div>

        <div className="pi-title">Tax Invoice</div>

        <div className="pi-meta">
          <div><span>Bill No.</span><span>{bill.bill_number}</span></div>
          <div><span>Date</span><span>{created.toLocaleDateString('en-IN')}</span></div>
          <div><span>Time</span><span>{created.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span></div>
          <div><span>Payment</span><span>{PAY_LABEL[bill.payment_method] || '—'}</span></div>
          {bill.customer_name && <div><span>Customer</span><span>{bill.customer_name}</span></div>}
        </div>

        <table className="pi-items">
          <thead>
            <tr><th>Item</th><th>Qty</th><th>Rate</th><th>Amount</th></tr>
          </thead>
          <tbody>
            {bill.items.map((it, i) => (
              <tr key={i}>
                <td>{it.name}</td>
                <td>{formatQty(it.qty, it.unit)}</td>
                <td>{money(it.price)}{it.unit === 'gram' && '/g'}</td>
                <td>{money(it.price * it.qty)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="pi-totals">
          <div><span>Subtotal</span><span>{money(bill.subtotal)}</span></div>
          {bill.discount > 0 && <div><span>Discount</span><span>−{money(bill.discount)}</span></div>}
          <div><span>CGST</span><span>{money(bill.cgst)}</span></div>
          <div><span>SGST</span><span>{money(bill.sgst)}</span></div>
          <div className="pi-grand"><span>Grand Total</span><span>{money(bill.grand_total)}</span></div>
        </div>

        <div className="pi-footer">Thank you for dining with us!</div>
      </div>
    </div>
  );
}
