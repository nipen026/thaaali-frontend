import { useEffect } from 'react';

const SITE_URL = 'https://thaali.app';
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.jpg`;

function upsertMeta(attr, key, content) {
  let el = document.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertLink(rel, href) {
  let el = document.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

function upsertJsonLd(id, data) {
  let el = document.getElementById(id);
  if (!el) {
    el = document.createElement('script');
    el.id = id;
    el.type = 'application/ld+json';
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

// Lightweight, dependency-free head manager for the public marketing/auth pages —
// react-helmet-async would be overkill for a handful of consumers. Authenticated
// /app/* pages don't call this; they're behind login and shouldn't be indexed anyway.
export function useDocumentHead({ title, description, path = '', image, jsonLd }) {
  useEffect(() => {
    const prevTitle = document.title;
    const canonical = `${SITE_URL}${path}`;
    const ogImage = image || DEFAULT_OG_IMAGE;

    if (title) {
      document.title = title;
      upsertMeta('property', 'og:title', title);
      upsertMeta('name', 'twitter:title', title);
    }
    if (description) {
      upsertMeta('name', 'description', description);
      upsertMeta('property', 'og:description', description);
      upsertMeta('name', 'twitter:description', description);
    }
    upsertLink('canonical', canonical);
    upsertMeta('property', 'og:url', canonical);
    upsertMeta('property', 'og:image', ogImage);
    upsertMeta('name', 'twitter:image', ogImage);

    const jsonLdList = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];
    const jsonLdIds = jsonLdList.map((_, i) => `seo-jsonld-${i}`);
    jsonLdList.forEach((data, i) => upsertJsonLd(jsonLdIds[i], data));

    return () => {
      document.title = prevTitle;
      jsonLdIds.forEach((id) => document.getElementById(id)?.remove());
    };
  }, [title, description, path, image, jsonLd]);
}
