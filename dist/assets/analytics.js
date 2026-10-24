(() => {
  'use strict';
  try { if (localStorage.getItem('ijexa-disable-tracking') === 'true') return; } catch {}
  const settings = window.IJEXA_ANALYTICS || {};
  const measurementId = /^G-[A-Z0-9]+$/.test(settings.measurementId || '') ? settings.measurementId : '';
  const adsId = /^AW-[0-9]+$/.test(settings.adsId || '') ? settings.adsId : '';
  const destinations = [adsId, measurementId].filter(Boolean);
  if (!destinations.length) return;
  if (window.__ijexaGoogleTagInitialized) return;
  window.__ijexaGoogleTagInitialized = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  window.gtag('set', 'allow_ad_personalization_signals', false);
  window.gtag('js', new Date());
  // Preservar apenas parâmetros conhecidos de atribuição. Descartar os demais.
  const campaignKeys = new Set(['utm_source', 'utm_medium', 'utm_campaign',
    'utm_id', 'utm_term', 'utm_content', 'utm_source_platform',
    'utm_creative_format', 'utm_marketing_tactic', 'gclid', 'gbraid', 'wbraid']);
  const pageUrl = new URL(location.origin + location.pathname);
  for (const [key, value] of new URLSearchParams(location.search)) {
    if (!campaignKeys.has(key) || !value || value.length > 512) continue;
    // UTM não deve conter dados de clientes; rejeitar e-mails e caracteres de controle.
    if (/@|[\u0000-\u001f\u007f]/.test(value)) continue;
    pageUrl.searchParams.set(key, value);
  }
  const pageLocation = pageUrl.href;
  destinations.forEach((id) => window.gtag('config', id, {
    page_location: pageLocation,
    page_referrer: document.referrer ? document.referrer.split(/[?#]/)[0] : '',
    allow_google_signals: false,
    allow_ad_personalization_signals: false
  }));
  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(destinations[0]);
  document.head.appendChild(script);
  document.addEventListener('click', (event) => {
    const anchor = event.target instanceof Element ? event.target.closest('a[href]') : null;
    if (!anchor) return;
    const url = new URL(anchor.href, location.href);
    if (['wa.me', 'api.whatsapp.com', 'web.whatsapp.com'].includes(url.hostname)) {
      window.gtag('event', 'whatsapp_click', { contact_category: 'whatsapp', event_category: 'contact', event_label: 'lead', contact_channel: 'whatsapp', send_to: destinations });
    }
  }, { passive: true });
})();
