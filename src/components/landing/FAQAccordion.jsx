import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const FAQS = [
  {
    q: 'Do I need to install anything or buy special hardware?',
    a: 'No. THAAALI runs entirely in the browser — on a laptop, POS terminal, or tablet. There\'s nothing to install for staff; the kitchen display, floor view, and billing screen all just need a web browser and an internet connection.',
  },
  {
    q: 'Can I run both my restaurant and hotel from one account?',
    a: 'Yes. THAAALI supports restaurant-only, hotel-only, or combined setups. When you enable both, your team switches between tables, orders, and rooms without a second login or a second subscription.',
  },
  {
    q: 'Is billing GST-compliant?',
    a: 'Yes. Every bill supports CGST/SGST split, itemized tax, discounts, and split payments across UPI, card, and cash — generated and ready to print or share at checkout.',
  },
  {
    q: 'What can each staff role see?',
    a: 'Access is role-based out of the box: owners and managers see full analytics and settings, waiters see the floor and order entry, kitchen staff see only the live KDS queue, cashiers see billing, and hotel desk staff see rooms and reservations.',
  },
  {
    q: 'Do I need a credit card to start?',
    a: 'No. You can create your account and set up your menu, tables, or rooms first, without entering payment details.',
  },
  {
    q: 'What happens to my data if I stop using THAAALI?',
    a: 'Your orders, menu, inventory, and billing history stay under your account and can be exported at any time — there\'s no lock-in.',
  },
];

export default function FAQAccordion() {
  const [open, setOpen] = useState(0);

  return (
    <div className="landing-faq">
      {FAQS.map((item, i) => {
        const isOpen = open === i;
        return (
          <div className={`faq-item ${isOpen ? 'on' : ''}`} key={item.q}>
            <button
              type="button"
              className="faq-q"
              onClick={() => setOpen(isOpen ? -1 : i)}
              aria-expanded={isOpen}
            >
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
