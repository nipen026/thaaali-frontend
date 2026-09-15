import { useEffect, useRef, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export default function Modal({ open, onClose, title, headerExtra, children, footer, size }) {
  const titleId = useId();
  const modalRef = useRef(null);
  const triggerRef = useRef(null);
  // Every caller passes `onClose` as a fresh inline arrow function, so its identity changes on
  // every render of the parent — including renders caused by typing into a controlled input
  // inside this modal. Reading it via a ref (kept fresh below, outside the effect) lets the
  // open/close effect depend on `open` alone, instead of re-running — and re-stealing focus
  // onto the first focusable element — on every keystroke in the parent.
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    triggerRef.current = document.activeElement;

    const onKeyDown = (e) => {
      if (e.key === 'Escape') { onCloseRef.current?.(); return; }
      if (e.key !== 'Tab' || !modalRef.current) return;
      const focusable = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };

    document.addEventListener('keydown', onKeyDown);
    modalRef.current?.querySelector('button, [href], input, select, textarea')?.focus();

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      triggerRef.current?.focus?.();
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="overlay"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
        >
          <motion.div
            ref={modalRef}
            className="modal"
            style={size ? { maxWidth: size } : undefined}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? titleId : undefined}
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: 'spring', stiffness: 340, damping: 28 }}
          >
            {title && (
              <div className="modal-hd">
                <div className="modal-title" id={titleId}>{title}</div>
                <div className="flex gap-2">
                  {headerExtra}
                  <button className="modal-x" onClick={onClose} aria-label="Close">
                    <X size={16} />
                  </button>
                </div>
              </div>
            )}
            <div className="modal-bd">{children}</div>
            {footer && <div className="modal-ft">{footer}</div>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
