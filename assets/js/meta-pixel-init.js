'use strict';

/**
 * Meta Pixel no browser (código oficial comprimido).
 * 1) Substitua META_PIXEL_ID pelo ID do Gestor de Eventos (só números, 15–16 dígitos).
 * 2) Se passar a usar o mesmo Pixel só no Cloudflare Zaraz, apague a tag deste ficheiro
 *    em todas as páginas para não contar visitas em duplicado.
 */
(function () {
  var META_PIXEL_ID = '';

  var id = String(META_PIXEL_ID || '').trim();
  if (!id || !/^\d{15,16}$/.test(id)) {
    return;
  }

  if (window.fbq) {
    return;
  }

  !(function (f, b, e, v, n, t, s) {
    if (f.fbq) {
      return;
    }
    n = f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) {
      f._fbq = n;
    }
    n.push = n;
    n.loaded = !0;
    n.version = '2.0';
    n.queue = [];
    t = b.createElement(e);
    t.async = !0;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

  fbq('init', id);
  fbq('track', 'PageView');
})();
