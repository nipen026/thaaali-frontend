import { useEffect } from 'react';

function upsertMeta(attr, key, content) {
  let el = document.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

// Lightweight, dependency-free head manager for the one page that actually needs
// dynamic SEO metadata (the public landing page) — react-helmet-async would be overkill
// for a single consumer. Authenticated /app/* pages don't call this; they're behind
// login and shouldn't be indexed anyway.
export function useDocumentHead({ title, description }) {
  useEffect(() => {
    const prevTitle = document.title;
    if (title) document.title = title;
    if (description) {
      upsertMeta('name', 'description', description);
      upsertMeta('property', 'og:description', description);
    }
    return () => { document.title = prevTitle; };
  }, [title, description]);
}
