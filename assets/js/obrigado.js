'use strict';

/** Meta padrão Lead após Web3Forms. Pixel só via Zaraz (fbq); espera fbq até ~8s (Zaraz costuma injetar async). */
(function () {
  var fired = false;

  function fireLead() {
    if (fired) return true;
    if (typeof window.fbq !== 'function') return false;
    try {
      window.fbq('track', 'Lead');
      fired = true;
      return true;
    } catch (e) {
      return false;
    }
  }

  function tryUntil(maxMs) {
    var start = Date.now();
    function tick() {
      if (fireLead()) return;
      if (Date.now() - start >= maxMs) return;
      setTimeout(tick, 200);
    }
    tick();
  }

  function boot() {
    if (fireLead()) return;
    tryUntil(8000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
