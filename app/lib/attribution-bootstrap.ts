/** Runs before hydration and before advertising tags; it never cleans the URL. */
export const ATTRIBUTION_BOOTSTRAP = `(() => {
  try {
    var p = new URLSearchParams(window.location.search);
    var keys = ['utm_source','utm_medium','utm_campaign','utm_content','utm_term','gclid','gbraid','wbraid','msclkid','fbclid'];
    var captured = {};
    keys.forEach(function(k) { var v = p.get(k); if (v) captured[k] = v.slice(0, 500); });
    window.__dsLandingAttribution = { params: captured, referrer: document.referrer || '', path: window.location.pathname };
    window.__dsLandingUrl = window.location.href;
  } catch (_) {}
})();`;
