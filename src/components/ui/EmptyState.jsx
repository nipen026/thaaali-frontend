import { Inbox } from 'lucide-react';

export default function EmptyState({ icon, title, subtitle, action }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon || <Inbox size={48} strokeWidth={1.5} />}</div>
      {title && <div className="empty-state-title">{title}</div>}
      {subtitle && <div className="empty-state-subtitle">{subtitle}</div>}
      {action && <div className="empty-state-action">{action}</div>}
    </div>
  );
}
