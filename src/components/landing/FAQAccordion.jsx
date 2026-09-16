import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { FAQS } from '../../config/faqs';

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
