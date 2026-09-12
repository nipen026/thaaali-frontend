import { AlertTriangle } from 'lucide-react';
import Modal from './Modal';

export default function ConfirmDialog({
  open, onClose, onConfirm, title = 'Are you sure?', message,
  confirmLabel = 'Confirm', cancelLabel = 'Cancel', danger = true,
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <>
          <button className="btn btn-sc" onClick={onClose}>{cancelLabel}</button>
          <button className={`btn ${danger ? 'btn-da' : 'btn-pr'}`} onClick={() => { onConfirm?.(); onClose?.(); }}>
            {confirmLabel}
          </button>
        </>
      }
    >
      <div className="flex gap-3" style={{ alignItems: 'flex-start' }}>
        {danger && <AlertTriangle size={20} style={{ color: 'var(--crimson)', flexShrink: 0, marginTop: 2 }} />}
        <div style={{ fontSize: 13.5, color: 'var(--slate)' }}>{message}</div>
      </div>
    </Modal>
  );
}
