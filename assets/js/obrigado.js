'use strict';

/** Meta padrão Lead: página de conclusão após envio do formulário (Web3Forms redirect). Pixel via Zaraz (fbq). */
(function () {
  function fireLead() {
    if (typeof window.fbq !== 'function') return;
    try {
      window.fbq('track', 'Lead');
    } catch (e) {
      /* noop */
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fireLead);
  } else {
    fireLead();
  }
})();
