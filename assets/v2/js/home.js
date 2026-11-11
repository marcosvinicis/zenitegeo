(function () {
  'use strict';

  var M = window.Motion;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var largo = window.matchMedia('(min-width: 961px)');
  var EASE = [0.22, 0.8, 0.2, 1];
  var anima = !!M && !reduce;

  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }

  function tween(from, to, ms, update, done) {
    var t0 = null;
    function step(t) {
      if (t0 === null) t0 = t;
      var k = Math.min(1, (t - t0) / ms);
      update(from + (to - from) * (1 - Math.pow(1 - k, 3)));
      if (k < 1) requestAnimationFrame(step); else if (done) done();
    }
    requestAnimationFrame(step);
  }

  /* Anima quando o elemento entra na tela (uma vez) */
  function quando(el, fn, margem) {
    if (!('IntersectionObserver' in window)) { fn(); return; }
    var io = new IntersectionObserver(function (es) {
      if (es.some(function (e) { return e.isIntersecting; })) { io.disconnect(); fn(); }
    }, { rootMargin: margem || '0px 0px -12% 0px', threshold: 0.12 });
    io.observe(el);
  }

  /* ---------- Hero: cartões de vidro entram e acompanham o ponteiro de leve ---------- */
  function initHero() {
    var hero = $('.hero-foto');
    if (!hero) return;
    var cards = $$('.vidros .vidro', hero);
    /* Sem efeitos de entrada no topo (melhor LCP); só o movimento leve com o ponteiro, depois de a página carregar */
    if (anima && fine && largo.matches) {
      var st = { tx: 0, ty: 0, cx: 0, cy: 0 }, raf = 0;
      var prof = cards.map(function (c, i) { return 6 + i * 5; });
      var laco = function () {
        st.cx += (st.tx - st.cx) * 0.07;
        st.cy += (st.ty - st.cy) * 0.07;
        cards.forEach(function (c, i) {
          c.style.translate = (st.cx * -prof[i]).toFixed(2) + 'px ' + (st.cy * -prof[i]).toFixed(2) + 'px';
        });
        raf = (Math.abs(st.tx - st.cx) > 0.002 || Math.abs(st.ty - st.cy) > 0.002) ? requestAnimationFrame(laco) : 0;
      };
      hero.addEventListener('pointermove', function (ev) {
        var r = hero.getBoundingClientRect();
        st.tx = (ev.clientX - r.left) / r.width - 0.5;
        st.ty = (ev.clientY - r.top) / r.height - 0.5;
        if (!raf) raf = requestAnimationFrame(laco);
      });
      hero.addEventListener('pointerleave', function () { st.tx = 0; st.ty = 0; if (!raf) raf = requestAnimationFrame(laco); });
    }
  }

  /* No celular, a barra de WhatsApp só aparece depois do topo (o botão do topo já cumpre o papel) */
  function initBarra() {
    var hero = $('.hero');
    function barra() { document.body.classList.toggle('com-barra', !hero || window.scrollY > hero.offsetHeight * 0.75); }
    window.addEventListener('scroll', barra, { passive: true });
    barra();
  }

  /* ---------- Situações: lista à esquerda, "o que muda" à direita ---------- */
  function initDores() {
    var box = $('#dores');
    if (!box) return;
    var itens = $$('.dor', box);
    box.classList.add('tabs');
    function sel(i, animar) {
      itens.forEach(function (el, k) {
        var on = k === i;
        el.classList.toggle('on', on);
        $('.dor-bt', el).setAttribute('aria-expanded', on ? 'true' : 'false');
      });
      if (animar && anima) {
        M.animate($('.dor-pn', itens[i]), { opacity: [0, 1], transform: ['translateY(12px)', 'translateY(0px)'] }, { duration: 0.45, ease: EASE });
      }
    }
    itens.forEach(function (el, k) {
      var bt = $('.dor-bt', el);
      bt.addEventListener('click', function () { sel(k, true); });
      bt.addEventListener('keydown', function (ev) {
        var d = ev.key === 'ArrowDown' ? 1 : ev.key === 'ArrowUp' ? -1 : 0;
        if (!d) return;
        ev.preventDefault();
        var n = (k + d + itens.length) % itens.length;
        $('.dor-bt', itens[n]).focus();
        sel(n, true);
      });
    });
    sel(0, false);
  }

  /* ---------- Contraste: as linhas entram uma a uma ---------- */
  function initContraste() {
    var linhas = $$('.contraste tbody tr');
    if (!linhas.length || !anima) return;
    linhas.forEach(function (l) { l.style.opacity = 0; });
    quando($('.contraste'), function () {
      linhas.forEach(function (l, i) {
        M.animate(l, { opacity: [0, 1], transform: ['translateY(14px)', 'translateY(0px)'] }, { duration: 0.55, delay: i * 0.1, ease: EASE });
      });
    }, '0px 0px -8% 0px');
    setTimeout(function () { linhas.forEach(function (l) { if (l.style.opacity === '0') l.style.opacity = 1; }); }, 6000);
  }

  /* ---------- Método: a linha sobe conforme a página rola ---------- */
  function initMetodo() {
    var wrap = $('.subir');
    if (!wrap) return;
    var lis = $$('.passos9 li', wrap);
    var fill = $('.trilho-sub i', wrap);
    if (!anima || !('IntersectionObserver' in window)) { lis.forEach(function (l) { l.classList.add('on'); }); return; }
    M.scroll(M.animate(fill, { transform: ['scaleY(0)', 'scaleY(1)'] }, { ease: 'linear' }), { target: wrap, offset: ['start 62%', 'end 58%'] });
    lis.forEach(function (l) { l.classList.add('fut'); });
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        var passou = en.isIntersecting || en.boundingClientRect.top < 0;
        en.target.classList.toggle('on', passou);
        en.target.classList.toggle('fut', !passou);
      });
    }, { rootMargin: '0px 0px -42% 0px' });
    lis.forEach(function (l) { io.observe(l); });
  }

  /* ---------- Cases: botões da trilha ---------- */
  function initTrilha() {
    var t = $('#trilha');
    if (!t) return;
    var prev = $('.bt-prev'), next = $('.bt-next');
    function passo() { var c = $('.caso3', t); return c ? c.getBoundingClientRect().width + 28 : 320; }
    function estado() {
      prev.setAttribute('aria-disabled', t.scrollLeft < 6 ? 'true' : 'false');
      next.setAttribute('aria-disabled', t.scrollLeft + t.clientWidth >= t.scrollWidth - 6 ? 'true' : 'false');
    }
    prev.addEventListener('click', function () { t.scrollBy({ left: -passo(), behavior: reduce ? 'auto' : 'smooth' }); });
    next.addEventListener('click', function () { t.scrollBy({ left: passo(), behavior: reduce ? 'auto' : 'smooth' }); });
    t.addEventListener('scroll', estado, { passive: true });
    window.addEventListener('resize', estado);
    estado();
    t.addEventListener('keydown', function (ev) {
      if (ev.key === 'ArrowRight') { ev.preventDefault(); next.click(); }
      if (ev.key === 'ArrowLeft') { ev.preventDefault(); prev.click(); }
    });
  }

  /* ---------- Evidências: ampliar ---------- */
  function initZoom() {
    var dlg = $('#zoom');
    if (!dlg || !dlg.showModal) return;
    var img = $('img', dlg), cap = $('p', dlg);
    $$('.ev-bt').forEach(function (b) {
      b.addEventListener('click', function () {
        img.src = b.dataset.full; img.alt = b.dataset.alt; cap.textContent = b.dataset.cap;
        dlg.showModal();
      });
    });
    dlg.addEventListener('click', function (ev) { if (ev.target === dlg) dlg.close(); });
  }


  /* ---------- Painel Google / IA: ao passar o mouse, mostra o que cada canal lê ---------- */
  function initHoverCanais() {
    var con = $('#console');
    if (!con || !fine) return;
    var blocos = $$('.bloco', con);
    var leg = $('#legenda');
    var TXT = {
      seo: '<b>Google (SEO).</b> O Google lê estes sinais para decidir em que ordem mostrar as páginas.',
      geo: '<b>Respostas de IA (GEO).</b> A IA lê estes sinais para montar uma resposta que cita fontes que ela consegue verificar.',
      ambos: '<b>Os dois canais.</b> O mesmo site alimenta o Google e as respostas de IA; alguns sinais servem aos dois.'
    };
    var COR = { seo: '#00D4FF', geo: '#9DAEFF', ambos: '#3EF0C0' };
    var guardado = null;
    function prever(c) {
      if (guardado === null) guardado = leg.innerHTML;
      con.classList.add('hov');
      con.style.setProperty('--ph', COR[c]);
      blocos.forEach(function (bl) {
        bl.classList.toggle('pv', c === 'ambos' || bl.dataset.c.split(' ').indexOf(c) > -1);
      });
      leg.innerHTML = TXT[c];
    }
    function limpar() {
      con.classList.remove('hov');
      blocos.forEach(function (bl) { bl.classList.remove('pv'); });
      if (guardado !== null) { leg.innerHTML = guardado; guardado = null; }
    }
    $$('.alterna button').forEach(function (b) {
      b.addEventListener('pointerenter', function () { prever(b.dataset.canal); });
      b.addEventListener('pointerleave', limpar);
      b.addEventListener('focus', function () { prever(b.dataset.canal); });
      b.addEventListener('blur', limpar);
      b.addEventListener('click', function () { guardado = null; });
    });
    con.addEventListener('pointermove', function (ev) {
      var r = con.getBoundingClientRect();
      con.style.setProperty('--mx', (ev.clientX - r.left) + 'px');
      con.style.setProperty('--my', (ev.clientY - r.top) + 'px');
    });
  }


  /* ---------- Celular: segundo parágrafo da definição recolhido, com "Ler mais" ---------- */
  function initMais() {
    var mais = $('#mais-geo');
    if (!mais || largo.matches) return;
    mais.classList.add('fecha');
    var bt = document.createElement('button');
    bt.type = 'button'; bt.className = 'mais-bt'; bt.textContent = 'O que é GEO';
    bt.setAttribute('aria-expanded', 'false'); bt.setAttribute('aria-controls', 'mais-geo');
    mais.parentNode.insertBefore(bt, mais.nextSibling);
    bt.addEventListener('click', function () {
      var aberto = mais.classList.toggle('fecha') === false;
      bt.setAttribute('aria-expanded', aberto ? 'true' : 'false');
      bt.textContent = aberto ? 'Mostrar menos' : 'O que é GEO';
    });
  }

  initHero();
  initBarra();
  initDores();
  initContraste();
  initMetodo();
  initTrilha();
  initZoom();
  initHoverCanais();
  initMais();
})();
