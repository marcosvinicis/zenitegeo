# Zênite GEO — piloto Data Hub 1.9F

Staging Worker + Static Assets. **Produção Pages em zenitegeo.com.br permanece intocada.**

Esta fase não faz deploy, não cria Worker na conta Cloudflare, não configura Zaraz, DNS, GA4, Ads ou Meta.

## 1. Produção vs piloto

| | Produção | Piloto (esta branch) |
|---|---|---|
| Runtime | Cloudflare Pages | Cloudflare Worker + Static Assets |
| Hostname | zenitegeo.com.br | workers.dev / wrangler dev apenas |
| Git | `main` | `feat/zdh-1.9f-pilot` (sem merge) |
| Tracking | Pixel direto + `zeniteZarazPush` legado | Foundation 1.9F + Pixel/legado **off** no hostname de staging |
| Consent | `localStorage zenite_lgpd` (não é autoridade edge) | Fail-closed até Zaraz CMP gravar `_zdh_consent` |
| Hub | não | contrato de env; sem credencial real nesta fase |

Não há `routes` para zenitegeo.com.br no `wrangler.jsonc`. Não há `env.production`.

## 2. Como o package oficial é reutilizado

Não republicar no npm. Não copiar Worker divergente.

**O tarball NÃO é versionado neste repo** (gitignore `vendor/*.tgz`).

Ele contém dist Worker + dist browser, source maps, `package.json`, `README.md` e `src/astro/ZeniteTracking.astro`. A foundation pertence ao Data Hub.

- `vendor/SOURCE.txt` — procedência, commit `deb0293`, SHA-256 esperado
- `package.json` depende de `file:vendor/zenite-edge-tracking-0.1.0.tgz` (arquivo local, gitignored)
- `npm run build` falha se o artefato estiver ausente ou o SHA não bater

```bash
bash scripts/vendor-edge-tracking.sh /path/to/zenite-data-hub
npm install
npm run build
```

Nunca usar path absoluto de máquina. Nunca publicar o package.

Worker: `createEdgeTrackingHandler()` de `@zenite/edge-tracking`.  
Browser: `installDomTracking()` de `@zenite/edge-tracking/browser`, bundlado em `assets/js/zdh-tracking.js`.

## 3. Worker + assets

`wrangler.jsonc` → Worker `zenitegeo-zdh-pilot`.

- `assets.directory`: `./dist-site` (gerado; **não** a raiz do git)
- `npm run build` copia só HTML público, CSS/JS browser, imagens, `_headers`, `_redirects`, `404.html`, robots/sitemap
- `run_worker_first`: HTML + rotas dinâmicas; estáticos (css/js/imagens) na pipeline de assets
- `not_found_handling`: `404-page` — HTTP **404** + corpo de `404.html`
- `html_handling`: `none` (pretty URLs no Worker)
- `_headers` e `_redirects` entram em `dist-site/`

Camada específica deste site (não reimplementa a foundation):

1. 308 `/arquivo.html` → `/arquivo` **com query intacta**
2. Rewrite `/contato` → `ASSETS.fetch(/contato.html)`
3. `X-Robots-Tag: noindex, nofollow, noarchive` em HTML, inclusive 404
4. Rota inexistente permanece status 404 (não soft-404 200)

`env.ASSETS.fetch` continua sendo o da foundation, via wrapper de pretty URLs.

## 4. Diferenças Pages vs Worker (conhecidas)

- Pretty URLs: Pages nativo; Worker replica via `src/pretty-urls.ts` e `html_handling: "none"` (o default `auto-trailing-slash` redirecionava `/contato.html` de volta para `/contato` e gerava loop).
- `Access-Control-Allow-Origin: *` visto em produção **não** está no `_headers` do repo (provável Transform Rule). Staging não reproduz isso.
- Early Hints 103 do Pages não são o alvo deste piloto.
- `request.cf` existe no Worker remoto; no `wrangler dev` local costuma ser ausente (`edge_context` omitido, fail-safe da foundation).
- Zaraz auto-inject **não** é validado em workers.dev. Bridge 1.9F-H é no-op sem `window.zaraz`.

## 5. Browser (HTML vanilla)

Não há Astro. Não há `<ZeniteTracking />`.

Mecanismo reutilizável para expandir depois:

```html
<script type="module" src="/assets/js/zdh-tracking.js"></script>
```

Páginas piloto **somente**:

- `/` (`index.html`)
- `/contato` (`contato.html`)
- `/analise-presenca-digital`

O bundle só chama `installDomTracking()` em `localhost` / `127.0.0.1` / `*.workers.dev`. Em zenitegeo.com.br o módulo é inerte.

Não há listeners paralelos da foundation. No staging, `main.js` não registra `zeniteZarazPush` legado.

## 6. Eventos

| Evento | Origem |
|---|---|
| `page_view` | Worker GET HTML apenas |
| `whatsapp_click` | autodetect `wa.me` |
| `phone_click` / `email_click` | autodetect `tel:` / `mailto:` |
| `cta_click` | home → formulário (`data-zdh-event`) |
| `quote_click` | LP “Solicitar análise” (`#solicitar-analise`) |
| `form_start` / `form_field_progress` / `form_identity_observed` / `form_submit` | forms opt-in |

Browser **não** emite `page_view`. Zaraz `track("page_view")` não é chamado pela foundation.

## 7. Forms

| Form | `data-zdh-form` | identity |
|---|---|---|
| `#contact-form` | `contact-form` | email + phone |
| `#form-analise` | `analise-presenca` | email + phone |

Não marcados: textarea, nome, hidden, honeypot, UTM, fbclid, file, password. Submit Web3Forms inalterado (sem `preventDefault` novo).

## 8. Consent

Arquitetura alvo: Zaraz CMP → cookie first-party → Worker 1.9F-B.

Nesta fase Zaraz CMP **não** está configurada. O Worker lê:

- `ZDH_CONSENT_COOKIE_NAME=_zdh_consent`
- purposes canônicos `analytics` / `advertising` / `user_data` (placeholders, não IDs reais do dashboard)

Ausência/invalidade → fail-closed (`analytics=false`, `advertising=false`, `user_data=false`).  
`user_data` nunca é inferido de Aceitar legado nem de analytics/ads.

O banner LGPD **não é removido do HTML**. Em hostname de staging ele é escondido e **não grava** `zenite_lgpd`. Quando a CMP Zaraz existir, o mesmo gate de hostname já evita duas CMPs.

Eventos comerciais da foundation podem seguir com consent fail-closed; `page_view`, sessão e `edge_context` exigem `analytics=true`.

## 9. Pixel direto

`meta-pixel-init.js` e `obrigado.js` retornam cedo em `*.workers.dev` / localhost. O código de produção permanece no arquivo. Destino Meta futuro: Zaraz, não este snippet.

## 10. Hub — contrato de ambiente

| Nome | Onde | Notas |
|---|---|---|
| `ZDH_INGEST_URL` | vars | `https://hub.staging.invalid/api/events/ingest` — **não** `*.zenitegeo.com.br` |
| `ZDH_TRACKING_ENABLED` | vars | `true` no piloto |
| `ZDH_ENVIRONMENT` | vars | `preview` |
| `ZDH_SITE_KEY` | secret Worker apenas | **não** definido nesta fase; nunca `PUBLIC_*` |

Regra da foundation (`wouldContaminateProduction`): preview/development **nunca** encaminham para hostname `zenitegeo.com.br` ou subdomínio. Esta etapa **não** enfraquece essa proteção. Ingest de staging terá de ser outro host quando a credencial real existir.

Sem `ZDH_SITE_KEY`, o proxy responde `202` com `outcome=misconfigured` (site não quebra).

## 11. Sessão / page_view / attribution / edge_context

Sem alteração da foundation:

- `_zdh_sid` / `_zdh_s0` HttpOnly, Secure em HTTPS, SameSite=Lax, 30 min / 12 h, só com `analytics=true` e tracking on
- Preview usa sufixo `_preview` nos defaults
- `page_view` no GET HTML via `waitUntil`
- Atribuição capturada na edge (UTM, gclid, fbclid, referrer)
- `edge_context` de `request.cf`: country, region, region_code, city, asn, as_organization, colo, timezone, http_protocol — sem IP/UA/lat-long/postal

## 12. Zaraz

Bridge 1.9F-H já está no bundle. Sem `window.zaraz` → no-op.  
Não inserir `/cdn-cgi/zaraz/i.js`. Não adicionar IDs, GTM, gtag ou Pixel.

## 13. SEO do preview

- Header `X-Robots-Tag` em HTML
- Canonical, sitemap e JSON-LD de produção **não** alterados
- Preview **não** entra no sitemap
- Hostname de preview **não** é escrito no schema

## 14. Performance (bytes no disco, gzip nível 9)

| Asset | Raw | Gzip | Escopo |
|---|---:|---:|---|
| `index.html` | 63 261 | 14 736 | home |
| `contato.html` | 18 367 | 5 334 | contato |
| `analise-presenca-digital.html` | 37 347 | 8 664 | LP |
| `assets/css/style.css` | 58 447 | 11 753 | global (inalterado) |
| `assets/js/main.js` | 14 250 | 4 209 | global (gates staging) |
| `assets/js/meta-pixel-init.js` | 1 388 | 794 | global (skip staging) |
| `assets/js/zdh-tracking.js` | 12 704 | 4 017 | **somente 3 páginas piloto** |

O HTML das três páginas ganha um `<script type="module">` (~70 bytes). Sem MutationObserver, sem framework. CSS inalterado. `wrangler.jsonc` rebuilda o bundle via `npm run build:browser`.

## 15. Segurança

- `ZDH_SITE_KEY` ausente do git, HTML e bundle
- `/_zdh/e` same-origin (foundation)
- Body ≤ 32 KiB
- Browser não é autoridade de consent, session_id ou edge_context
- Logs da foundation sem PII / query completa
- Falha de tracking não derruba a página
- `wrangler deploy` **não** faz parte desta fase

## 16. Testes locais

```bash
npm run build
npm test
npm run typecheck
npm run check:worker   # wrangler deploy --dry-run apenas
npm run dev            # wrangler dev — não é deploy
```

## 17. O que esta fase não faz

Deploy, Worker real na conta, site key real, env no dashboard, DNS, custom domain, Zaraz dashboard, alteração do projeto Pages, merge em `main`, commit/push (até aprovação).
