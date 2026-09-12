import toast from 'react-hot-toast';
import { createElement } from 'react';
import { CheckCircle2, XCircle, Info } from 'lucide-react';

export const notifySuccess = (msg) =>
  toast(msg, { icon: createElement(CheckCircle2, { size: 18, color: 'var(--jade)' }) });

export const notifyError = (msg) =>
  toast(msg, { icon: createElement(XCircle, { size: 18, color: 'var(--crimson)' }) });

export const notifyInfo = (msg) =>
  toast(msg, { icon: createElement(Info, { size: 18, color: 'var(--sky)' }) });
