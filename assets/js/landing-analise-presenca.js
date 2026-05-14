'use strict';

(function () {
  /** Preenche hidden UTM/fbclid a partir da query string; ignora erros e parâmetros ausentes. */
  function fillAttributionFromUrl() {
    var form = document.getElementById('form-analise');
    if (!form) return;

    var params;
    try {
      params = new URLSearchParams(window.location.search || '');
    } catch (e) {
      return;
    }

    function setVal(id, key) {
      var el = document.getElementById(id);
      if (!el) return;
      try {
        var raw = params.get(key);
        if (raw === null || raw === undefined) {
          el.value = '';
          return;
        }
        var s = String(raw).trim();
        if (s.length > 2000) s = s.slice(0, 2000);
        el.value = s;
      } catch (err) {
        el.value = '';
      }
    }

    setVal('lp-h-utm_source', 'utm_source');
    setVal('lp-h-utm_medium', 'utm_medium');
    setVal('lp-h-utm_campaign', 'utm_campaign');
    setVal('lp-h-utm_content', 'utm_content');
    setVal('lp-h-utm_term', 'utm_term');
    setVal('lp-h-fbclid', 'fbclid');
  }

  fillAttributionFromUrl();

  /* WhatsApp: eventos via main.js (data-z-event nos links) + zeniteZarazPush */

  var form = document.getElementById('form-analise');
  if (form) {
    form.addEventListener('submit', function () {
      if (typeof window.zeniteZarazPush === 'function') {
        window.zeniteZarazPush({
          event: 'submit_form_analise',
          form_id: 'analise_presenca'
        });
      }
    });
  }
})();
