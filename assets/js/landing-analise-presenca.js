'use strict';

(function () {
  function pushDL(payload) {
    if (window.dataLayer) {
      window.dataLayer.push(payload);
    }
  }

  function bindWa(el, eventName, extra) {
    if (!el) return;
    el.addEventListener('click', function () {
      var p = { event: eventName };
      if (extra) {
        Object.keys(extra).forEach(function (k) {
          p[k] = extra[k];
        });
      }
      pushDL(p);
    });
  }

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

  bindWa(document.getElementById('lp-wa-hero'), 'click_whatsapp_hero');
  bindWa(document.getElementById('lp-wa-final'), 'click_whatsapp_final');
  bindWa(document.getElementById('lp-wa-float'), 'click_whatsapp_floating');
  bindWa(document.getElementById('lp-wa-near-form'), 'click_whatsapp_hero', { cta_placement: 'near_form' });

  var form = document.getElementById('form-analise');
  if (form) {
    form.addEventListener('submit', function () {
      pushDL({ event: 'submit_form_analise' });
    });
  }
})();
