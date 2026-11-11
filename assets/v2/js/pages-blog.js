/* Blog: índice recolhível no celular, item atual do índice e filtro por categoria. Sem JS tudo continua visível. */
(function () {
  'use strict';

  /* índice: aberto no desktop, recolhido no celular */
  var toc = document.querySelector('.pb-toc');
  if (toc) {
    var mq = window.matchMedia('(min-width: 1000px)');
    if (!mq.matches) toc.open = false;
    if (mq.addEventListener) mq.addEventListener('change', function () { if (mq.matches) toc.open = true; });
    toc.addEventListener('click', function (ev) {
      var a = ev.target.closest && ev.target.closest('a');
      if (a && !mq.matches) toc.open = false;
    });

    /* destaca a seção que está em leitura */
    var links = Array.prototype.slice.call(toc.querySelectorAll('a[href^="#"]'));
    var alvos = links.map(function (a) { return document.getElementById(decodeURIComponent(a.getAttribute('href').slice(1))); });
    if ('IntersectionObserver' in window && links.length) {
      var atual = null;
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (en) {
          if (en.isIntersecting) {
            var i = alvos.indexOf(en.target);
            if (i > -1 && links[i] !== atual) {
              if (atual) atual.removeAttribute('aria-current');
              atual = links[i];
              atual.setAttribute('aria-current', 'true');
            }
          }
        });
      }, { rootMargin: '-15% 0px -70% 0px' });
      alvos.forEach(function (t) { if (t) io.observe(t); });
    }
  }

  /* filtro do índice do blog */
  var barra = document.getElementById('pb-filtros');
  var grade = document.getElementById('pb-cards');
  if (barra && grade) {
    barra.hidden = false;
    var cards = Array.prototype.slice.call(grade.querySelectorAll('.pb-pc'));
    var vazio = document.getElementById('pb-vazio');
    barra.addEventListener('click', function (ev) {
      var bt = ev.target.closest('.pb-f');
      if (!bt) return;
      var f = bt.getAttribute('data-f');
      Array.prototype.forEach.call(barra.querySelectorAll('.pb-f'), function (b) { b.setAttribute('aria-pressed', b === bt ? 'true' : 'false'); });
      var n = 0;
      cards.forEach(function (c) {
        var ok = f === 'all' || c.getAttribute('data-cat') === f;
        c.hidden = !ok;
        if (ok) n++;
      });
      if (vazio) vazio.hidden = n > 0;
    });
  }
})();
