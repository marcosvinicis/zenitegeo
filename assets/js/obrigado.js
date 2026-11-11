'use strict';

/**
 * Página /obrigado.
 * 1) Meta padrão Lead após Web3Forms. Pixel só via Zaraz (fbq); espera fbq até ~6s (Zaraz costuma injetar async).
 * 2) Abre o WhatsApp com os dados do formulário já formatados, só depois do Lead
 *    (para não perder a conversão). O botão "Continuar no WhatsApp" funciona a qualquer momento.
 */
(function () {
  var WHATSAPP = '5544997769301';
  var ESPERA_MAX_MS = 6000;
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

  /** O Pixel só envia o evento de fato quando o fbevents.js carregou (aí fbq.callMethod passa a existir). */
  function pixelPronto() {
    return typeof window.fbq === 'function' && typeof window.fbq.callMethod === 'function';
  }

  /**
   * Dispara o Lead e chama done() quando o Pixel confirmou que está ativo
   * ou quando o tempo máximo acabou (bloqueador de anúncios, cookies recusados, rede lenta).
   */
  function aposLead(done) {
    var start = Date.now();
    function tick() {
      fireLead();
      if (fired && pixelPronto()) return done(true);
      if (Date.now() - start >= ESPERA_MAX_MS) return done(fired);
      setTimeout(tick, 200);
    }
    tick();
  }

  function lerLead() {
    try {
      var raw = window.sessionStorage.getItem('zg_lead');
      if (!raw) return null;
      var d = JSON.parse(raw);
      if (!d || !d.campos || !d.campos.length) return null;
      if (Date.now() - d.t > 30 * 60 * 1000) return null;
      return d;
    } catch (e) {
      return null;
    }
  }

  function mensagem(d) {
    var linhas = ['Olá, Marcos! Acabei de enviar o ' + d.origem + ' no site da Zenite GEO.', ''];
    d.campos.forEach(function (c) {
      linhas.push('*' + c[0] + ':* ' + c[1]);
    });
    linhas.push('', 'Pode me responder por aqui?');
    return linhas.join('\n');
  }

  function link(texto) {
    return 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(texto);
  }

  function boot() {
    var botao = document.getElementById('obrigado-whatsapp');
    var status = document.getElementById('obrigado-wa-status');
    var lead = lerLead();
    var url = link(lead ? mensagem(lead) : 'Olá, Marcos! Enviei o formulário no site da Zenite GEO e quero conversar.');
    if (botao) botao.setAttribute('href', url);

    if (lead) {
      try { window.sessionStorage.removeItem('zg_lead'); } catch (e) {}
      if (status) status.hidden = false;
    }

    aposLead(function () {
      if (!lead) return;
      // folga para o navegador enviar o beacon do Pixel antes de sair da página
      setTimeout(function () {
        window.location.href = url;
      }, 1000);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
