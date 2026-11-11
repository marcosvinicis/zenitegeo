'use strict';

/**
 * Guarda os dados do formulário no navegador (sessionStorage) no momento do envio.
 * O envio continua nativo para o Web3Forms (e-mail) e redireciona para /obrigado,
 * onde obrigado.js abre o WhatsApp com a mensagem formatada.
 * Nada é enviado por aqui para servidores externos.
 */
(function () {
  var IGNORAR = /^(access_key|subject|redirect|botcheck|landing_page|lead_source|campaign_context|utm_.*|fbclid)$/;

  function rotulo(el) {
    var l = el.id ? document.querySelector('label[for="' + el.id + '"]') : null;
    var t = l ? l.textContent : el.name;
    return t.replace(/\s*\*\s*$/, '').replace(/\s+/g, ' ').trim();
  }

  function valor(el) {
    if (el.tagName === 'SELECT') {
      var o = el.options[el.selectedIndex];
      return o && !o.disabled ? o.value : '';
    }
    return (el.value || '').trim();
  }

  function ligar(id, origem) {
    var form = document.getElementById(id);
    if (!form) return;
    form.addEventListener('submit', function () {
      try {
        var campos = [];
        Array.prototype.forEach.call(form.elements, function (el) {
          if (!el.name || IGNORAR.test(el.name)) return;
          if (el.type === 'hidden' || el.type === 'submit' || el.type === 'button') return;
          var v = valor(el);
          if (v) campos.push([rotulo(el), v.slice(0, 500)]);
        });
        window.sessionStorage.setItem(
          'zg_lead',
          JSON.stringify({ origem: origem, campos: campos, t: Date.now() })
        );
      } catch (e) {
        /* sem sessionStorage: o botão da página de agradecimento continua funcionando */
      }
    });
  }

  ligar('contact-form', 'formulário de contato');
  ligar('form-analise', 'formulário da Análise de Presença Digital');
})();
