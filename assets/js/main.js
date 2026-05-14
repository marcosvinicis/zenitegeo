/* ============================================================
   ZENITE GEO — main.js v1.0
   SEO & GEO para Especialistas de Alto Padrão
   ============================================================ */

'use strict';

/** Cloudflare Zaraz + dataLayer: conversões sem pixel no HTML (ativar GA4/ações no painel Zaraz). */
(function initZeniteZarazPush() {
  window.dataLayer = window.dataLayer || [];
  window.zeniteZarazPush = function (payload) {
    if (!payload || typeof payload.event !== 'string' || !payload.event) return;
    try {
      window.dataLayer.push(payload);
    } catch (e) {
      /* noop */
    }
    var z = window.zaraz;
    if (z && typeof z.track === 'function') {
      var props = {};
      Object.keys(payload).forEach(function (k) {
        if (k === 'event') return;
        var v = payload[k];
        if (typeof v === 'number' || typeof v === 'boolean') props[k] = v;
        else props[k] = String(v == null ? '' : v);
      });
      try {
        var pr = z.track(payload.event, props);
        if (pr && typeof pr.then === 'function') pr.catch(function () {});
      } catch (err) {
        /* noop */
      }
    }
  };

  /** Eventos padrão Meta (fbq) quando o Pixel for injetado pelo Zaraz — sem script da Meta no HTML. */
  window.zeniteMetaStandardEvent = function (standardEvent, params) {
    if (typeof window.fbq !== 'function' || !standardEvent) return;
    try {
      if (params && typeof params === 'object' && Object.keys(params).length) {
        window.fbq('track', standardEvent, params);
      } else {
        window.fbq('track', standardEvent);
      }
    } catch (err) {
      /* noop */
    }
  };
})();

// ── MENU MOBILE ───────────────────────────────────────────
const hamburger = document.getElementById('hamburger');
const siteNav   = document.getElementById('site-nav');

if (hamburger && siteNav) {
  hamburger.addEventListener('click', () => {
    const isOpen = siteNav.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Fechar ao clicar em link
  siteNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      siteNav.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });
}

// ── HEADER SCROLL ─────────────────────────────────────────
const header = document.querySelector('.site-header');
if (header) {
  const onScroll = () => {
    header.style.background = window.scrollY > 60
      ? 'rgba(6,14,26,0.95)'
      : 'rgba(10,22,40,0.85)';
  };
  window.addEventListener('scroll', onScroll, { passive: true });
}

// ── FAQ ACCORDION ─────────────────────────────────────────
document.querySelectorAll('.faq-question').forEach(btn => {
  btn.addEventListener('click', () => {
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    const answerId = btn.getAttribute('aria-controls');
    const answer   = document.getElementById(answerId);

    // Fechar todos
    document.querySelectorAll('.faq-question').forEach(b => {
      b.setAttribute('aria-expanded', 'false');
      const aid = b.getAttribute('aria-controls');
      const ans = document.getElementById(aid);
      if (ans) ans.style.maxHeight = '0';
    });

    // Abrir este (se estava fechado)
    if (!expanded && answer) {
      btn.setAttribute('aria-expanded', 'true');
      answer.style.maxHeight = answer.scrollHeight + 'px';
    }
  });
});

// Abrir primeiro item por padrão
const firstFaq = document.querySelector('.faq-question[aria-expanded="true"]');
if (firstFaq) {
  const firstAnswer = document.getElementById(firstFaq.getAttribute('aria-controls'));
  if (firstAnswer) firstAnswer.style.maxHeight = firstAnswer.scrollHeight + 'px';
}

// ── CALCULADORA DE ECONOMIA (ROI) ─────────────────────────
const adsSpendInput = document.getElementById('ads-spend');
const agencyFeeInput = document.getElementById('agency-fee');
const calcTriggerBtn = document.getElementById('calc-trigger');
const resAdsCost = document.getElementById('res-ads-cost');
const resEconomy = document.getElementById('res-economy');

function calculateROI() {
  if (!adsSpendInput || !agencyFeeInput || !resAdsCost || !resEconomy) return;
  
  const adsSpend = parseFloat(adsSpendInput.value) || 0;
  const agencyFee = parseFloat(agencyFeeInput.value) || 0;
  
  // Cálculo de 24 meses
  const totalMonthlyAds = adsSpend + agencyFee;
  const total24Months = totalMonthlyAds * 24;
  
  // Atualiza a UI
  resAdsCost.textContent = 'R$ ' + total24Months.toLocaleString('pt-BR');
  resEconomy.textContent = 'R$ ' + total24Months.toLocaleString('pt-BR');
  
  // Pequena animação no resultado
  resEconomy.style.opacity = '0.5';
  setTimeout(() => {
    resEconomy.style.opacity = '1';
    resEconomy.style.transition = 'opacity 0.3s ease';
  }, 50);
}

if (calcTriggerBtn) {
  calcTriggerBtn.addEventListener('click', calculateROI);
}

// Roda a conta no carregamento para preencher inicial
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', calculateROI);
} else {
  calculateROI();
}

// Atualiza em tempo real ao digitar
if (adsSpendInput) adsSpendInput.addEventListener('input', calculateROI);
if (agencyFeeInput) agencyFeeInput.addEventListener('input', calculateROI);

// ── FADE-IN NO SCROLL ─────────────────────────────────────
const fadeEls = document.querySelectorAll('.fade-in');
if (fadeEls.length && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
  fadeEls.forEach(el => observer.observe(el));
} else {
  fadeEls.forEach(el => el.classList.add('visible'));
}

// ── LGPD BANNER ───────────────────────────────────────────
const lgpdBanner  = document.getElementById('lgpd-banner');
const lgpdAccept  = document.getElementById('lgpd-accept');
const lgpdReject  = document.getElementById('lgpd-reject');

if (lgpdBanner) {
  if (!localStorage.getItem('zenite_lgpd')) {
    setTimeout(() => lgpdBanner.classList.add('show'), 1500);
  }

  const dismissLGPD = (accepted) => {
    lgpdBanner.classList.remove('show');
    localStorage.setItem('zenite_lgpd', accepted ? 'accepted' : 'rejected');
  };

  if (lgpdAccept) lgpdAccept.addEventListener('click', () => dismissLGPD(true));
  if (lgpdReject) lgpdReject.addEventListener('click', () => dismissLGPD(false));
}

// ── FOOTER ANO ATUAL ──────────────────────────────────────
const yearEl = document.getElementById('footer-year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ── HAMBURGUER ANIMAÇÃO ───────────────────────────────────
// Pequena animação nos spans ao abrir/fechar menu
if (hamburger && siteNav) {
  const spans = hamburger.querySelectorAll('span');
  const updateHamburger = () => {
    const isOpen = siteNav.classList.contains('open');
    if (spans[0]) spans[0].style.transform = isOpen ? 'rotate(45deg) translate(5px, 5px)' : '';
    if (spans[1]) spans[1].style.opacity   = isOpen ? '0'              : '1';
    if (spans[2]) spans[2].style.transform = isOpen ? 'rotate(-45deg) translate(5px,-5px)' : '';
  };
  hamburger.addEventListener('click', updateHamburger);
}

// ── ZARAZ / DATALAYER: WhatsApp (todos os wa.me) + formulário contato ──
(function bindZeniteConversionEvents() {
  if (typeof window.zeniteZarazPush !== 'function') return;

  document.body.addEventListener(
    'click',
    function (e) {
      var t = e.target;
      if (!t || typeof t.closest !== 'function') return;
      var a = t.closest('a[href*="wa.me"]');
      if (a) {
        var eventName = a.getAttribute('data-z-event');
        if (!eventName) {
          if (a.id === 'whatsapp-float') eventName = 'click_whatsapp_float';
          else if (a.id === 'nav-cta-whatsapp') eventName = 'click_whatsapp_nav';
          else eventName = 'click_whatsapp';
        }
        var p = { event: eventName };
        if (a.id) p.link_id = a.id;
        window.zeniteZarazPush(p);
        if (typeof window.zeniteMetaStandardEvent === 'function') {
          window.zeniteMetaStandardEvent('Contact');
        }
        return;
      }
      a = t.closest('a[href^="tel:"], a[href^="mailto:"]');
      if (a) {
        window.zeniteZarazPush({
          event: 'click_contact_link',
          link_id: a.id || '',
          contact_type: a.href.indexOf('tel:') === 0 ? 'tel' : 'mailto'
        });
        if (typeof window.zeniteMetaStandardEvent === 'function') {
          window.zeniteMetaStandardEvent('Contact');
        }
      }
    },
    false
  );

  var cf = document.getElementById('contact-form');
  if (cf) {
    cf.addEventListener('submit', function () {
      window.zeniteZarazPush({ event: 'submit_contact_form', form_id: 'contact' });
    });
  }
})();
