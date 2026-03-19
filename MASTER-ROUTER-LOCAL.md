# MASTER-ROUTER-LOCAL.md
# ZENITE GEO LOCAL FRAMEWORK™ v1.0
# Passo zero obrigatorio — ler antes de qualquer acao

---

## O QUE E ESTE ARQUIVO

Este e o arquivo de roteamento central do ZENITE GEO LOCAL FRAMEWORK™.
Ele instrui o agente de IA sobre o modo de operacao, fluxo de trabalho,
estrutura de arquivos e regras inegociaveis para construcao de sites
de negocios locais com SEO + GEO de alta performance.

Leia este arquivo integralmente antes de executar qualquer etapa.
Nao pule secoes. Nao antecipe etapas.

---

## DIFERENCA ENTRE OS DOIS FRAMEWORKS

| Criterio              | Framework Especialistas     | Framework Local (este)         |
|-----------------------|-----------------------------|--------------------------------|
| Publico               | Dentistas, medicos, advogados | Todo tipo de negocio local   |
| Compliance            | CRO, CFM, OAB, CRC          | Compliance generico local       |
| Briefing              | 66 + 20 perguntas           | 30 perguntas                   |
| Fluxo                 | 4 chats                     | 3 chats                        |
| Topical Map           | Obrigatorio (blog + cluster) | Opcional (tier Dominancia)    |
| Foco Schema           | Person + Service + E-E-A-T  | LocalBusiness + areaServed     |
| Paginas de area       | Opcional                    | Obrigatorio (minimo 3 bairros) |
| Prazo medio           | 2-3 semanas                 | 1-2 semanas                    |

---

## ESTRUTURA DE PASTAS NO REPOSITORIO

```
zenite-geo-framework/
├── especialistas/
│   └── MASTER-ROUTER.md        ← framework atual (nao alterar)
└── local/
    ├── MASTER-ROUTER-LOCAL.md  ← voce esta aqui
    ├── briefing-local.md
    ├── diretriz-cline-local.md
    ├── modulo-bairros.md
    ├── compliance-local.md
    └── templates/
        ├── home.html
        ├── bairro.html
        ├── sobre.html
        ├── contato.html
        └── footer.html
```

Projetos de clientes ficam em:
```
projects/[nome-do-cliente]-local/
```

---

## FLUXO OBRIGATORIO: 3 CHATS

### CHAT 1 — Antigravity / Gemini
Objetivo: Briefing + Pesquisa + Copy

Executar nesta ordem:
1. Ler briefing-local.md e coletar respostas do cliente
2. Pesquisar 10 keywords locais principais (formato: [servico] em [bairro/cidade])
3. Auditar Google Business Profile do cliente (dados, fotos, avaliacoes, categoria)
4. Identificar 3 concorrentes locais e listar gaps
5. Gerar copy completo para todas as paginas (home, sobre, contato, cada bairro)
6. Salvar output em: projects/[cliente]-local/chat1-output.md

Entregavel: chat1-output.md com copy aprovado e lista de bairros definida.

### CHAT 2 — Cline / Claude
Objetivo: Design + Desenvolvimento + Paginas de bairro

Pre-requisito: chat1-output.md aprovado e disponivel no repositorio.

Executar nesta ordem:
1. Ler MASTER-ROUTER-LOCAL.md (este arquivo)
2. Ler diretriz-cline-local.md
3. Ler modulo-bairros.md
4. Ler chat1-output.md do cliente
5. Gerar estrutura de arquivos do projeto
6. Construir home.html
7. Construir sobre.html e contato.html
8. Construir uma pagina de bairro por vez (nao gerar todas de uma vez)
9. Construir footer.html com todos os links de bairros
10. Gerar llms.txt na raiz

Regra critica: executar apenas o arquivo solicitado por vez.
Nao antecipar proximas paginas.

Entregavel: projeto completo em projects/[cliente]-local/

### CHAT 3 — Cline / Gemini
Objetivo: Schemas + Deploy + Configuracao

Pre-requisito: projeto construido e revisado no Chat 2.

Executar nesta ordem:
1. Gerar Schema LocalBusiness principal (JSON-LD na home)
2. Gerar Schema FAQPage para cada pagina de bairro
3. Gerar Schema BreadcrumbList para paginas internas
4. Gerar sitemap.xml com todas as URLs
5. Gerar robots.txt (permitir GPTBot, ClaudeBot, PerplexityBot)
6. Deploy no Cloudflare Pages
7. Configurar dominio customizado
8. Submeter sitemap no Google Search Console
9. Ativar Zaraz + GA4 no Cloudflare dashboard
10. Verificar PageSpeed (alvo: 90+)

Entregavel: site ao vivo com Analytics confirmado.

---

## DEFINICAO DE MODO

Antes de iniciar o Chat 1, definir o tier do projeto:

### EXPRESS
- Home + Sobre + Contato + 3 paginas de bairro
- Schema basico (LocalBusiness + FAQ)
- Prazo: 5-7 dias uteis
- Para: negocios com poucos concorrentes locais

### PREMIUM
- Home + Sobre + Contato + 6 a 10 paginas de bairro
- Schema completo + areaServed expandido
- Pagina de servico por categoria principal
- Prazo: 8-12 dias uteis
- Para: mercados com concorrencia moderada

### DOMINANCIA
- Home + Sobre + Contato + 10+ paginas de bairro
- Schema completo + blog com artigo pilar + 4 satelites
- Paginas de servico individuais
- Prazo: 15-20 dias uteis
- Para: mercados altamente competitivos

---

## ESTRUTURA DE PAGINAS OBRIGATORIA

### Home (index.html)
Ordem dos blocos:
1. Hero com H1 localizado + CTA WhatsApp primario
2. AI Answer Box (max 55 palavras, tom enciclopedico)
3. Servicos principais (cards ou lista)
4. Por que nos (diferenciais reais)
5. Prova social (depoimentos ou numeros reais)
6. Area de atendimento (mapa ou lista de bairros com links)
7. FAQ (minimo 5 perguntas) com Schema FAQPage
8. CTA final WhatsApp contextual

### Pagina de Bairro (/[nicho]-[bairro]-[cidade]/)
Ordem dos blocos:
1. Hero com H1 hiperlocal + CTA WhatsApp
2. AI Answer Box localizado
3. Por que atendemos o [bairro] (texto especifico, nao copiar da home)
4. Servicos disponivel para o bairro
5. FAQ local (minimo 3 perguntas sobre o bairro)
6. Links para outros bairros atendidos
7. CTA final WhatsApp com mensagem pre-preenchida especifica do bairro

### Sobre (sobre.html)
- Historia real do negocio
- Fundador / equipe (com foto se disponivel)
- Tempo de mercado e numeros reais
- Certificacoes ou associacoes
- Missao em linguagem humana (sem jargao)

### Contato (contato.html)
- Endereco completo com Google Maps embed
- WhatsApp com link direto
- Telefone fixo (se houver)
- Horario de funcionamento
- Formulario simples (nome, telefone, mensagem) — opcional

---

## REGRAS DE SEO LOCAL INEGOCIAVEIS

Keywords:
- H1 deve conter: [servico] + [bairro ou cidade]
- Title tag: [servico] em [bairro] - [cidade] | [Nome do negocio]
- Meta description: mencionar servico + bairro + diferencial + CTA
- URL: /[nicho]-[bairro]-[cidade]/ (tudo em slug, sem acentos)

Links internos:
- Minimo 3 por pagina
- Ancoras descritivas (proibido "clique aqui" ou "saiba mais")
- Cada pagina de bairro linka para home e para 2 outros bairros
- Footer linka para todos os bairros

WhatsApp:
- Cada pagina tem mensagem pre-preenchida unica
- Formato: Ola! Vim pelo site e preciso de [servico] no [bairro].
- Link: https://wa.me/55[numero]?text=[mensagem-codificada]

---

## SCHEMA STACK POR PAGINA

### Home
- LocalBusiness (principal)
- OpeningHoursSpecification
- GeoCoordinates
- areaServed (todos os bairros)
- FAQPage

### Pagina de Bairro
- LocalBusiness (com areaServed especifico do bairro)
- FAQPage
- BreadcrumbList

### Sobre
- LocalBusiness
- Person (se houver fundador com dados reais)

### Contato
- LocalBusiness
- PostalAddress

---

## AI ANSWER BOX — FORMATO OBRIGATORIO

Presente em toda pagina estrategica.
Classe CSS: ai-answer
Maximo: 55 palavras
Tom: factual, enciclopedico, citavel por IA

Estrutura padrao:
[Nome do negocio] e um(a) [categoria] localizado(a) em [bairro/cidade].
Especializado(a) em [servico principal], [diferencial real].
Atende [bairros ou regiao]. Contato: [WhatsApp].

Exemplo real:
"Auto Center Maringá e um auto center localizado na Zona 01, Maringa.
Especializado em alinhamento, balanceamento e revisao preventiva, com
15 anos de experiencia. Atende toda a regiao norte de Maringa.
Contato: (44) 9 9999-9999."

---

## ANALYTICS E DEPLOY

Analytics:
- Exclusivamente Cloudflare Zaraz
- Nunca inserir scripts de rastreamento diretamente no HTML
- Deixar comentario no HTML: <!-- Analytics: ativar via Cloudflare Zaraz -->

Deploy:
- Cloudflare Pages (unico destino autorizado)
- GitHub como repositorio fonte
- Push no main = deploy automatico

Robots.txt obrigatorio:
```
User-agent: *
Allow: /

User-agent: GPTBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /

Sitemap: https://[dominio]/sitemap.xml
```

---

## PLACEHOLDERS PADRAO

Usar sempre que dado estiver faltando:
- [[INSERIR-NOME-NEGOCIO]]
- [[INSERIR-DOMINIO]]
- [[INSERIR-TELEFONE]]
- [[INSERIR-WHATSAPP]]
- [[INSERIR-ENDERECO]]
- [[INSERIR-CEP]]
- [[INSERIR-HORARIO-ABERTURA]]
- [[INSERIR-HORARIO-FECHAMENTO]]
- [[INSERIR-LINK-GOOGLEMAPS]]
- [[INSERIR-GOOGLE-BUSINESS-URL]]
- [[INSERIR-LAT]]
- [[INSERIR-LNG]]

Regra: se mais de 3 placeholders estiverem faltando em sequencia,
parar e solicitar os dados ao usuario antes de continuar.

---

## COMPLIANCE LOCAL

Para negocios locais genericos (nao profissionais liberais):
- Nao fazer promessas de resultado garantido
- Nao usar superlativos sem embasamento ("o melhor", "o unico")
- Depoimentos somente se reais e com autorizacao
- AggregateRating somente com dados reais do GBP

Para negocios com regulamentacao especifica:
- Clinicas de estetica: verificar resolucoes ANVISA e CFM aplicaveis
- Seguranca privada: verificar exigencias PNSSP / SINDESP
- Alimentacao: verificar exigencias ANVISA e VIGILANCIA SANITARIA
- Em caso de duvida: usar compliance-local.md como referencia base

---

## CHECKLIST FINAL ANTES DO DEPLOY

[ ] Todos os placeholders substituidos por dados reais
[ ] Todas as paginas de bairro geradas
[ ] Footer com links para todos os bairros
[ ] Schemas validados em schema.org/validator
[ ] PageSpeed 90+ em mobile e desktop
[ ] Sitemap gerado e submetido
[ ] robots.txt permitindo bots de IA
[ ] llms.txt gerado na raiz
[ ] Zaraz ativo e confirmado no Cloudflare
[ ] GA4 recebendo dados (verificar em tempo real)
[ ] Search Console sem erros de indexacao
[ ] Links de WhatsApp testados em todos as paginas
[ ] AI Answer Box presente em home e paginas de bairro

---

## CREDITO OBRIGATORIO NO FOOTER

Todo site gerado com este framework deve conter no footer:
Estrutura digital desenvolvida por Zênite GEO (https://zenitegeo.com.br) — SEO & GEO para Empresas de Alto Padrão

---

_ZENITE GEO LOCAL FRAMEWORK™ v1.0_
_Zênite GEO — zenitegeo.com.br_
_Proibida reproducao sem autorizacao._

---

## TABELA DE CONDICIONAIS — REGRAS DE OMISSAO AUTOMATICA

O Cline le o client.json e aplica estas regras antes de gerar qualquer arquivo.
Nao publicar secao com dado ausente. Nao inventar dado para preencher secao.

| Flag no client.json         | Secao afetada                        | Acao se false/null          |
|-----------------------------|--------------------------------------|-----------------------------|
| has_phone                   | Telefone no header, footer, contato  | Remover linha inteira        |
| has_logo                    | Logo no header                       | Usar nome em texto           |
| has_hero_image              | Imagem no hero da home               | Remover bloco img            |
| has_reviews                 | Cards de avaliacoes curadas          | Remover secao inteira        |
| has_ratings                 | Nota Google + AggregateRating Schema | Remover bloco de nota        |
| has_team                    | Secao equipe em sobre.html           | Remover secao inteira        |
| has_certifications          | Secao certificacoes em sobre.html    | Remover secao inteira        |
| has_partners                | Parceiros em sobre.html              | Remover secao inteira        |
| has_awards                  | Premios em sobre.html                | Remover secao inteira        |
| has_promotions              | Promocao no hero e servicos          | Remover elemento             |
| has_blog                    | Blog preview na home + menu Blog     | Remover secao + link menu    |
| has_services_not_offered    | Secao "nao realizamos" em servicos   | Remover secao inteira        |
| has_sunday_hours            | Linha domingo na tabela de horarios  | Remover linha                |
| has_price                   | Preco nos cards de servico           | Remover elemento de preco    |
| has_domicile_service        | Secao areas em contato.html          | Remover secao inteira        |
| has_og_image                | meta og:image em todas as paginas    | Remover meta tag             |

### Regra de imagens (CLS — Cumulative Layout Shift)
- Toda tag <img> DEVE ter width e height definidos — valores em client.json > images
- Imagens sem dimensoes definidas = CLS = penalizacao no PageSpeed
- Hero e LCP: fetchpriority="high", SEM loading="lazy"
- Todas as outras: loading="lazy"
- Formato obrigatorio: WebP
- Alt obrigatorio e descritivo — nunca vazio, nunca "imagem", nunca "foto"
- Alt com keyword local quando fizer sentido natural
- Se image_file for null: remover tag <img> inteira, nao usar placeholder externo

### Regra de omissao de bairros (thin content)
Antes de gerar cada pagina de bairro, o Cline verifica:
- [ ] intro_text e unico (diferente de todos os outros bairros)
- [ ] intro_angle esta definido (proximidade / problema / solucao)
- [ ] whatsapp_message menciona o nome do bairro
- [ ] FAQ tem pelo menos 1 pergunta especifica do bairro
Se qualquer item falhar: parar e solicitar o dado antes de continuar.

### Regra de Schema condicional
- AggregateRating: somente se has_ratings = true E google_score != null E google_count != null
- Review: somente se has_reviews = true E reviews[] nao for null ou vazio
- Person: somente se has_team = true E team[] tiver ao menos 1 membro com name e role
- OpeningHoursSpecification domingo: somente se has_sunday_hours = true

