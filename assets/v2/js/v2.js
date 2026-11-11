(function () {
  'use strict';

  var root = document.documentElement;
  var M = window.Motion;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }
  var brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
  var EASE = [0.22, 0.8, 0.2, 1];
  var POP = [0.34, 1.56, 0.64, 1];

  function tween(from, to, ms, update, done) {
    if (reduce || ms <= 0) { update(to); if (done) done(); return { cancel: function () {} }; }
    var t0 = null, id = 0, dead = false;
    function step(t) {
      if (dead) return;
      if (t0 === null) t0 = t;
      var k = Math.min(1, (t - t0) / ms);
      var e = 1 - Math.pow(1 - k, 3);
      update(from + (to - from) * e);
      if (k < 1) id = requestAnimationFrame(step); else if (done) done();
    }
    id = requestAnimationFrame(step);
    return { cancel: function () { dead = true; cancelAnimationFrame(id); } };
  }

  /* Sem a biblioteca ou com movimento reduzido: tudo aparece pronto */
  if (!M || reduce) {
    root.classList.add('mo-ready');
    initSimulador(false);
    initDigitacao(false);
    initCanais(false);
    return;
  }

  /* ---------- Progresso de leitura ---------- */
  function initProgresso() {
    var bar = document.createElement('div');
    bar.className = 'progresso';
    bar.setAttribute('aria-hidden', 'true');
    document.body.appendChild(bar);
    M.scroll(M.animate(bar, { transform: ['scaleX(0)', 'scaleX(1)'] }, { ease: 'linear' }));
  }

  /* ---------- Hero: o mapa se desenha e os pinos caem ---------- */
  function initMapa() {
    var svg = $('.hero .mapa svg');
    if (!svg) return;
    var contornos = $('.hero .contornos');
    var alvo = $$('.uf-on', svg);
    var dim = $$('.uf-dim', svg);
    var pinos = $$('a, g.pin', svg);
    alvo.forEach(function (p) {
      var len = p.getTotalLength();
      p.style.strokeDasharray = len;
      p.style.strokeDashoffset = len;
      p.style.fillOpacity = 0;
    });
    dim.forEach(function (p) { p.style.opacity = 0; });
    pinos.forEach(function (a) {
      a.style.transformBox = 'fill-box';
      a.style.transformOrigin = 'center';
      a.style.opacity = 0;
    });
    root.classList.add('mo-ready');

    dim.forEach(function (p) { M.animate(p, { opacity: [0, 1] }, { duration: 0.9, ease: 'easeOut' }); });
    alvo.forEach(function (p) {
      var len = parseFloat(p.style.strokeDasharray);
      M.animate(p, { strokeDashoffset: [len, 0] }, { duration: 1.5, ease: [0.65, 0, 0.35, 1] });
      M.animate(p, { fillOpacity: [0, 1] }, { duration: 0.7, delay: 1.0, ease: 'easeOut' });
    });
    pinos.forEach(function (a, i) {
      M.animate(a, { opacity: [0, 1], transform: ['scale(0)', 'scale(1)'] }, { duration: 0.5, delay: 1.15 + i * 0.12, ease: POP });
    });
    $$('.anel', svg).forEach(function (r) { r.style.setProperty('--ad', '1.9s'); });

    if (contornos) {
      var hero = contornos.parentNode;
      M.scroll(M.animate(contornos, { transform: ['translateY(-24px)', 'translateY(70px)'] }, { ease: 'linear' }),
        { target: hero, offset: ['start start', 'end start'] });
    }
    var fim = $('.fechamento .contornos');
    if (fim) {
      M.scroll(M.animate(fim, { transform: ['translateY(-50px)', 'translateY(40px)'] }, { ease: 'linear' }),
        { target: fim.parentNode, offset: ['start end', 'end start'] });
    }
  }

  /* ---------- Estudo: barras crescem, números contam, captura é destacada ---------- */
  function initBusca() {
    var comp = $('.comp');
    if (comp) {
      var barras = $$('.trilho i', comp);
      var nums = $$('b.num', comp);
      var alvos = nums.map(function (n) { return parseFloat(n.textContent); });
      var delta = $('.delta', comp.parentNode);
      /* O texto real fica no HTML; só dentro da animação ele recomeça do zero */
      M.inView(comp, function () {
        barras.forEach(function (b, i) {
          M.animate(b, { transform: ['scaleX(0)', 'scaleX(1)'] }, { duration: 1.1, delay: i * 0.35, ease: EASE });
          nums[i].textContent = '0%';
          tween(0, alvos[i], 1100, function (v) { nums[i].textContent = Math.round(v) + '%'; });
        });
        if (delta) M.animate(delta, { opacity: [0, 1], transform: ['translateY(8px)', 'translateY(0px)'] }, { duration: 0.5, delay: 1.5, ease: EASE });
      }, { amount: 0.6 });
    }
    var prova = $('.prova');
    if (prova) {
      var marcas = $$('.alvo, .rot', prova);
      marcas.forEach(function (m) { m.style.opacity = 0; });
      M.inView(prova, function () {
        [['.alvo-1', 0.5], ['.rot-1', 0.8], ['.alvo-2', 1.7], ['.rot-2', 2.0]].forEach(function (par) {
          var el = $(par[0], prova);
          if (!el) return;
          var alvo = par[0].indexOf('alvo') > -1;
          M.animate(el, alvo
            ? { opacity: [0, 1], transform: ['scale(1.35)', 'scale(1)'] }
            : { opacity: [0, 1], transform: ['translateY(8px)', 'translateY(0px)'] },
            { duration: 0.55, delay: par[1], ease: alvo ? POP : EASE });
        });
      }, { amount: 0.5 });
    }
  }

  /* ---------- Cases: o site do cliente rola ao passar o mouse ---------- */
  function initCases() {
    $$('.caso3 .viewport').forEach(function (vp) {
      var img = $('img', vp);
      var anim = null, carregada = false, carregando = false;
      function distancia() { return Math.max(0, img.offsetHeight - vp.offsetHeight); }
      function descer() {
        var d = distancia();
        if (d < 40) return;
        if (anim) anim.stop();
        anim = M.animate(img, { transform: ['translateY(0px)', 'translateY(-' + d + 'px)'] }, { duration: Math.min(11, Math.max(3.5, d / 170)), ease: 'easeInOut' });
      }
      function subir() {
        if (anim) anim.stop();
        anim = M.animate(img, { transform: 'translateY(0px)' }, { duration: 0.7, ease: EASE });
      }
      function entrar() {
        if (carregada) { descer(); return; }
        if (carregando || !img.dataset.tall) return;
        carregando = true;
        var t = new Image();
        t.onload = function () { img.src = t.src; img.removeAttribute('height'); carregada = true; descer(); };
        t.src = img.dataset.tall;
      }
      var palco = vp.closest('.palco');
      if (canHover) {
        palco.addEventListener('pointerenter', entrar);
        palco.addEventListener('pointerleave', subir);
      }
      palco.addEventListener('focusin', entrar);
      palco.addEventListener('focusout', subir);
    });
  }

  initProgresso();
  initMapa();
  initBusca();
  initCases();
  initSimulador(true);
  initDigitacao(true);
  initCanais(true);
  initDisputa();
  initAssinatura();

  /* ---------- Simulador de tráfego híbrido ---------- */
  function initSimulador(animado) {
    var sim = $('#sim');
    if (!sim) return;
    var sGasto = $('#s-gasto'), sMeses = $('#s-meses'), sOrg = $('#s-org');
    var oGasto = $('#o-gasto'), oMeses = $('#o-meses'), oOrg = $('#o-org');
    var nBase = $('#n-base'), nHib = $('#n-hib'), nDif = $('#n-dif'), nota = $('#n-nota');
    var gBase = $('.sg-base', sim), gHib = $('.sg-hib', sim), gArea = $('.sg-area', sim);
    var tTopo = $('#sg-topo', sim), tRot = $('#sg-rot', sim), tArea = $('#sg-area', sim);
    var wa = $('#sim-wa', sim), clip = $('.sim-clip', sim), svg = $('svg', sim);
    var X0 = 56, X1 = 624, Y0 = 24, Y1 = 236;
    var atual = null, anim = null;

    function curva(T, X) {
      var p = [];
      for (var t = 0; t <= 24; t++) p.push(t <= 3 ? 1 : (t <= 3 + T ? 1 - X * (t - 3) / T : 1 - X));
      return p;
    }
    function px(t) { return X0 + (X1 - X0) * t / 24; }
    function py(m) { return Y1 - (Y1 - Y0) * m; }
    function desenhar(p) {
      var d = 'M', a = 'M' + px(0).toFixed(1) + ',' + py(1).toFixed(1) + ' L' + px(24).toFixed(1) + ',' + py(1).toFixed(1);
      var i;
      for (i = 0; i <= 24; i++) d += (i ? ' L' : '') + px(i).toFixed(1) + ',' + py(p[i]).toFixed(1);
      for (i = 24; i >= 0; i--) a += ' L' + px(i).toFixed(1) + ',' + py(p[i]).toFixed(1);
      gHib.setAttribute('d', d);
      gArea.setAttribute('d', a + 'Z');
    }
    function total(S, p) { var s = 0; for (var t = 1; t <= 24; t++) s += p[t] * S; return s; }
    function pintaFaixa(el) {
      var pc = (el.value - el.min) / (el.max - el.min) * 100;
      el.style.setProperty('--p', pc + '%');
    }
    function ler() { return { S: +sGasto.value, T: +sMeses.value, X: +sOrg.value / 100 }; }

    var cur = { base: 0, hib: 0, dif: 0, p: curva(12, 0.5) };
    function textos(v, alvo) {
      nBase.textContent = brl.format(v.base);
      nHib.textContent = brl.format(v.hib);
      nDif.textContent = brl.format(v.dif);
    }
    function atualizar(primeira) {
      var v = ler();
      var p = curva(v.T, v.X);
      var base = v.S * 24, hib = total(v.S, p), dif = base - hib;
      oGasto.textContent = brl.format(v.S);
      oMeses.textContent = v.T + ' meses';
      oOrg.textContent = Math.round(v.X * 100) + '%';
      [sGasto, sMeses, sOrg].forEach(pintaFaixa);
      tTopo.textContent = brl.format(v.S) + '/mês';
      var final = v.S * (1 - v.X);
      nota.textContent = 'A partir do mês ' + Math.min(24, 3 + v.T) + ', a verba mensal cai de ' + brl.format(v.S) + ' para ' + brl.format(final) + '.';
      var ini = cur.p.slice(), fb = cur.base, fh = cur.hib, fd = cur.dif;
      if (anim) anim.cancel();
      anim = tween(0, 1, (animado && !primeira) ? 450 : 0, function (k) {
        var q = [];
        for (var i = 0; i <= 24; i++) q.push(ini[i] + (p[i] - ini[i]) * k);
        desenhar(q);
        textos({ base: fb + (base - fb) * k, hib: fh + (hib - fh) * k, dif: fd + (dif - fd) * k });
      });
      cur = { base: base, hib: hib, dif: dif, p: p };
      var ax = px(15), ay = (py(1) + py(p[15])) / 2;
      tArea.setAttribute('x', ax); tArea.setAttribute('y', ay + 4);
      tArea.style.opacity = (1 - p[15]) > 0.12 ? 1 : 0;
      tRot.setAttribute('y', py(p[24]) - 10);
      svg.setAttribute('aria-label', 'Gráfico: com gasto de ' + brl.format(v.S) + ' por mês, a verba cai ' + Math.round(v.X * 100) + '% em ' + v.T + ' meses; diferença de ' + brl.format(dif) + ' em 24 meses.');
      var msg = 'Olá! Fiz a simulação no site da Zenite GEO' + (sim.dataset.pagina ? ' (' + sim.dataset.pagina + ')' : '') +
        ': gasto de ' + brl.format(v.S) + ' por mês em anúncios, reduzindo a verba em ' + v.T + ' meses com o orgânico atendendo ' + Math.round(v.X * 100) + '% das visitas. ' +
        'Daria uma diferença estimada de ' + brl.format(dif) + ' em 24 meses. Quero conversar sobre o meu caso.';
      wa.href = 'https://wa.me/' + sim.dataset.wa + '?text=' + encodeURIComponent(msg);
    }
    [sGasto, sMeses, sOrg].forEach(function (el) { el.addEventListener('input', function () { atualizar(false); }); });
    atualizar(true);

    if (animado && clip) {
      M.scroll(M.animate(clip, { clipPath: ['inset(0 100% 0 0)', 'inset(0 0% 0 0)'] }, { ease: 'linear' }),
        { target: clip, offset: ['start 92%', 'center 58%'] });
    }
  }

  /* ---------- Busca que se digita sozinha ---------- */
  function initDigitacao(animado) {
    var alvo = $('#digita-txt');
    if (!alvo) return;
    var botoes = $$('.pergs button');
    var frases = botoes.map(function (b) { return b.dataset.q; });
    if (!frases.length) return;
    alvo.textContent = frases[0];
    if (!animado) return;
    var i = 0, vivo = false, timer = 0, manual = 0;
    function digitar(txt, fim) {
      var n = 0;
      (function passo() {
        if (!vivo) return;
        n++; alvo.textContent = txt.slice(0, n);
        if (n < txt.length) timer = setTimeout(passo, 34 + Math.random() * 26); else timer = setTimeout(fim, 1900);
      })();
    }
    function apagar(fim) {
      var txt = alvo.textContent;
      (function passo() {
        if (!vivo) return;
        txt = txt.slice(0, -1); alvo.textContent = txt;
        if (txt.length) timer = setTimeout(passo, 16); else timer = setTimeout(fim, 260);
      })();
    }
    function ciclo() { digitar(frases[i % frases.length], function () { apagar(function () { i++; if (!manual) ciclo(); }); }); }
    function parar() { vivo = false; clearTimeout(timer); }
    botoes.forEach(function (b) {
      b.addEventListener('click', function () {
        parar(); manual = 1; alvo.textContent = b.dataset.q;
        clearTimeout(manual);
      });
    });
    M.inView($('.digita'), function () {
      if (manual === 1) return;
      vivo = true; alvo.textContent = ''; ciclo();
      return function () { parar(); };
    }, { amount: 0.6 });
  }

  /* ---------- Console: o que cada canal lê no site ---------- */
  function initCanais(animado) {
    var con = $('#console');
    if (!con) return;
    var botoes = $$('.alterna button');
    var pil = $('.alterna .pilula');
    var blocos = $$('.bloco', con);
    var leg = $('#legenda');
    var TXT = {
      seo: '<b>Google (SEO).</b> O Google lê estes sinais para decidir em que ordem mostrar as páginas.',
      geo: '<b>Respostas de IA (GEO).</b> A IA lê estes sinais para montar uma resposta que cita fontes que ela consegue verificar.',
      ambos: '<b>Os dois canais.</b> O mesmo site alimenta o Google e as respostas de IA; alguns sinais servem aos dois.'
    };
    var COR = { seo: '#00D4FF', geo: '#8DA0FF', ambos: '#00D4FF' };
    var prev = { l: 0, w: 0 };
    var atual = 'ambos';

    function pilula(btn, anim) {
      var l = btn.offsetLeft, w = btn.offsetWidth;
      pil.style.transform = 'translateX(' + l + 'px)';
      pil.style.width = w + 'px';
      if (anim && animado && prev.w) {
        M.animate(pil, { transform: ['translateX(' + prev.l + 'px)', 'translateX(' + l + 'px)'], width: [prev.w + 'px', w + 'px'] }, { duration: 0.45, ease: EASE });
      }
      prev = { l: l, w: w };
    }
    function aplicar(canal, anim) {
      atual = canal;
      botoes.forEach(function (b) {
        var on = b.dataset.canal === canal;
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
        if (on) pilula(b, anim);
      });
      con.style.setProperty('--cc', COR[canal]);
      pil.style.setProperty('--cc', COR[canal]);
      blocos.forEach(function (bl, i) {
        var lit = canal === 'ambos' || bl.dataset.c.split(' ').indexOf(canal) > -1;
        bl.classList.toggle('on', lit);
        bl.classList.toggle('off', !lit);
        if (anim && animado) {
          M.animate(bl, { transform: lit ? ['scale(0.96)', 'scale(1)'] : ['scale(1)', 'scale(0.985)'] }, { duration: 0.45, delay: i * 0.035, ease: EASE });
        }
      });
      if (anim && animado) M.animate(leg, { opacity: [0, 1], transform: ['translateY(6px)', 'translateY(0px)'] }, { duration: 0.4, ease: EASE });
      leg.innerHTML = TXT[canal];
    }
    botoes.forEach(function (b) { b.addEventListener('click', function () { if (b.dataset.canal !== atual) aplicar(b.dataset.canal, true); }); });
    aplicar('ambos', false);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { aplicar(atual, false); });
    window.addEventListener('resize', function () { aplicar(atual, false); });
  }

  /* ---------- Dados da cidade: números contam e barras crescem ---------- */
  function initDisputa() {
    var bloco = $('.disputa');
    if (!bloco) return;
    var nums = $$('.stats b[data-n]', bloco);
    var barras = $$('.barras-m .m-b i', bloco);
    var vals = $$('.barras-m .m-v', bloco);
    function f(v, tipo) {
      var n = Math.round(v);
      return tipo === 'pct' ? (n >= 0 ? '+' : '') + n + '%' : n.toLocaleString('pt-BR');
    }
    M.inView(bloco, function () {
      nums.forEach(function (el) {
        var alvo = parseFloat(el.dataset.n), tipo = el.dataset.f;
        tween(0, alvo, 1300, function (v) { el.textContent = f(v, tipo); });
      });
      barras.forEach(function (b, i) {
        M.animate(b, { transform: ['scaleX(0)', 'scaleX(1)'] }, { duration: 1, delay: 0.15 + i * 0.12, ease: EASE });
        var el = vals[i], alvo = parseInt(el.textContent.replace(/\D/g, ''), 10);
        tween(0, alvo, 1000, function (v) { el.textContent = Math.round(v).toLocaleString('pt-BR'); });
      });
    }, { amount: 0.4 });
  }

  /* ---------- Assinatura que se escreve ---------- */
  function initAssinatura() {
    var bloco = $('.assina');
    if (!bloco) return;
    var tr = $('.tr', bloco);
    var marca = $('.marca', bloco);
    M.inView(bloco, function () {
      var len = tr.getTotalLength();
      tr.style.strokeDasharray = len;
      M.animate(tr, { strokeDashoffset: [len, 0], fillOpacity: [0, 0] }, { duration: 2.6, ease: [0.55, 0.1, 0.3, 1] });
      M.animate(tr, { fillOpacity: [0, 1], strokeOpacity: [1, 0.25] }, { duration: 0.9, delay: 2.2, ease: 'easeOut' });
      if (marca) M.animate(marca, { opacity: [0, 1], transform: ['translateY(10px)', 'translateY(0px)'] }, { duration: 0.7, delay: 2.5, ease: EASE });
    }, { amount: 0.6 });
  }
})();
