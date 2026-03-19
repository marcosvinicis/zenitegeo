# modulo-bairros.md
# ZENITE GEO LOCAL FRAMEWORK™ v1.0
# Modulo de Paginas de Area — Instrucoes para o Cline (Chat 2)

---

## OBJETIVO DESTE MODULO

Instruir o agente a construir paginas de bairro (area pages) que:
- Rankeem para keywords hiperlocais no Google
- Sejam citadas por IAs quando alguem pergunta "[servico] em [bairro]"
- Convertam via WhatsApp com mensagem pre-preenchida especifica
- Sejam unicas entre si (proibido duplicar conteudo entre bairros)
- Interlinkeem corretamente home, footer e outras paginas de bairro

Este modulo e lido no inicio do Chat 2, junto com diretriz-cline-local.md.

---

## 1. QUANDO GERAR AS PAGINAS DE BAIRRO

Gerar paginas de bairro apenas apos:
- [ ] assets/css/main.css concluido
- [ ] templates/header.html concluido
- [ ] templates/footer.html concluido (com todos os links ja inseridos)
- [ ] index.html (home) concluida e revisada
- [ ] Lista de bairros confirmada no chat1-output.md

Nao gerar paginas de bairro antes da home estar pronta.
O footer ja deve conter todos os links de bairro antes da primeira pagina de area ser gerada.

---

## 2. QUANTIDADE POR TIER

| Tier | Paginas de bairro | Observacao |
|------|-------------------|------------|
| Express | 3 a 5 | Bairros de maior volume de busca |
| Premium | 6 a 10 | Bairros prioritarios + adjacentes |
| Dominancia | 10+ | Cobertura total da cidade ou regiao |

A lista de bairros e a ordem de prioridade vem do chat1-output.md (Secao 6).
Respeitar a ordem — os primeiros bairros da lista sao os mais estrategicos.

---

## 3. ESTRUTURA DE URL

Formato obrigatorio:
```
/[nicho-slug]-[bairro-slug]-[cidade-slug]/index.html
```

Regras de slug:
- Tudo em minusculo
- Remover acentos e cedilha
- Espacos viram hifen
- Remover caracteres especiais

Exemplos:
| Nicho | Bairro | Cidade | URL gerada |
|-------|--------|--------|-----------|
| Auto Center | Zona 01 | Maringa | /auto-center-zona-01-maringa/ |
| Barbearia | Jardim Alvorada | Maringa | /barbearia-jardim-alvorada-maringa/ |
| Eletricista | Santa Felicidade | Maringa | /eletricista-santa-felicidade-maringa/ |
| Estetica | Pinheiros | Maringa | /estetica-pinheiros-maringa/ |

---

## 4. ESTRUTURA HTML OBRIGATORIA DE CADA PAGINA DE BAIRRO

Gerar nesta ordem exata. Nao inverter blocos. Nao omitir blocos obrigatorios.

```
[1] HEAD — meta tags, title, canonical, preconnect fontes
[2] HEADER — include templates/header.html
[3] BREADCRUMB — navegacao estrutural
[4] HERO LOCAL — H1 + subtitulo + CTA WhatsApp primario
[5] AI ANSWER BOX — max 55 palavras, tom enciclopedico
[6] INTRODUCAO LOCAL — paragrafo unico por bairro (60-80 palavras)
[7] SERVICOS — lista ou cards dos servicos disponiveis
[8] DIFERENCIAIS — 3 itens especificos (reutilizar da home com adaptacao local)
[9] FAQ LOCAL — minimo 3 perguntas especificas do bairro
[10] OUTROS BAIRROS — links para demais paginas de area
[11] CTA FINAL — WhatsApp com mensagem especifica do bairro
[12] FOOTER — include templates/footer.html
```

---

## 5. DETALHAMENTO DE CADA BLOCO

### [1] HEAD

```html
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>[Nicho] em [Bairro] - [Cidade] | [Nome do negocio]</title>
  <meta name="description" content="[Nome do negocio] oferece [servico principal] no [Bairro] em [Cidade]. [Diferencial]. Fale agora pelo WhatsApp.">
  <link rel="canonical" href="https://[[INSERIR-DOMINIO]]/[slug-completo]/">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Syne:wght@800&family=Outfit:wght@400;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/assets/css/main.css">
  <!-- Schema JSON-LD: inserido no Chat 3 -->
  <!-- Analytics: ativar via Cloudflare Zaraz no dashboard -->
</head>
```

Title formula: [Nicho] em [Bairro] - [Cidade] | [Nome do negocio]
Description formula: mencionar servico + bairro + diferencial + CTA em ate 155 caracteres

### [2] BREADCRUMB

```html
<nav class="breadcrumb" aria-label="Navegacao estrutural">
  <ol>
    <li><a href="/">Home</a></li>
    <li><a href="/#areas">Areas atendidas</a></li>
    <li aria-current="page">[Nicho] em [Bairro]</li>
  </ol>
</nav>
```

### [3] HERO LOCAL

H1 obrigatorio contem: [Nicho] + "em" + [Bairro]
Subtitulo menciona cidade e diferencial principal.
CTA primario linka para WhatsApp com mensagem especifica.

```html
<section class="hero-local">
  <div class="hero-local__inner">
    <h1>[Nicho capitalizado] em [Bairro] — [Cidade]</h1>
    <p class="hero-local__sub">[Subtitulo com diferencial. 1-2 linhas. Usar copy do chat1-output.md]</p>
    <a href="https://wa.me/55[[NUMERO]]?text=[[MENSAGEM-BAIRRO-ENCODED]]"
       class="btn-whatsapp btn-whatsapp--primary"
       rel="noopener"
       aria-label="Abrir conversa no WhatsApp">
      Falar no WhatsApp
    </a>
  </div>
</section>
```

### [4] AI ANSWER BOX

```html
<section class="ai-answer" aria-label="Resumo do negocio">
  <p>[Copy exato do chat1-output.md para este bairro. Max 55 palavras.]</p>
</section>
```

Regras do AI Answer Box:
- Nunca ultrapassar 55 palavras
- Tom factual e enciclopedico (como Wikipedia, nao como anuncio)
- Mencionar: nome do negocio + categoria + bairro + cidade + servico + diferencial + contato
- Nao usar adjetivos subjetivos: "melhor", "excepcional", "incrivel"
- Usar o copy gerado no Chat 1 — nao reescrever

### [5] INTRODUCAO LOCAL

Paragrafo unico de 60 a 80 palavras.
Deve ser diferente do paragrafo da home e dos outros bairros.
Mencionar o bairro pelo nome pelo menos 2 vezes.
Mencionar a cidade pelo menos 1 vez.
Terminar com chamada para o WhatsApp ou para a proxima secao.

Proibido:
- Copiar o mesmo paragrafo entre bairros trocando apenas o nome
- Usar frases genericas como "oferecemos servicos de qualidade"
- Mencionar concorrentes pelo nome

### [6] SERVICOS

Reutilizar estrutura da home com adaptacao local minima.
Nao criar servicos que nao existem no briefing.
Usar os dados exatos do chat1-output.md.

```html
<section class="servicos-local">
  <h2>Servicos disponiveis no [Bairro]</h2>
  <ul class="servicos-grid">
    <li>
      <h3>[Nome do servico]</h3>
      <p>[Descricao curta. 1-2 linhas.]</p>
    </li>
    <!-- repetir para cada servico -->
  </ul>
</section>
```

### [7] FAQ LOCAL

Minimo 3 perguntas. Maximo 6 para paginas de bairro.
As perguntas devem ser especificas do bairro — nao genericas.

Perguntas obrigatorias (adaptar ao nicho):
1. "Voce atende no bairro [Bairro]?"
2. "Como solicitar [servico principal] no [Bairro]?"
3. "Qual o prazo de atendimento para clientes do [Bairro]?"

Perguntas opcionais (incluir se houver dado real para responder):
4. "Tem estacionamento proximo ao [Bairro]?"
5. "Atende fins de semana no [Bairro]?"
6. "Qual o valor do [servico] para quem mora no [Bairro]?"

```html
<section class="faq-local">
  <h2>Perguntas frequentes — [Nicho] no [Bairro]</h2>
  <div itemscope itemtype="https://schema.org/FAQPage">
    <div itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
      <h3 itemprop="name">[Pergunta]</h3>
      <div itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
        <p itemprop="text">[Resposta direta. 2-4 linhas. Mencionar bairro e cidade.]</p>
      </div>
    </div>
    <!-- repetir para cada pergunta -->
  </div>
</section>
```

Nota: o Schema FAQPage completo em JSON-LD e inserido no Chat 3.
O markup com itemscope aqui e adicional e nao substitui o JSON-LD.

### [8] OUTROS BAIRROS

Lista com link para todas as outras paginas de area.
Nao listar o bairro da pagina atual.
Titulo da secao menciona a cidade.

```html
<section class="outras-areas">
  <h2>Outras areas que atendemos em [Cidade]</h2>
  <ul class="areas-list">
    <li><a href="/[nicho]-[bairro-2]-[cidade]/">[Nicho] no [Bairro 2]</a></li>
    <li><a href="/[nicho]-[bairro-3]-[cidade]/">[Nicho] no [Bairro 3]</a></li>
    <!-- repetir para todos os bairros exceto o atual -->
  </ul>
</section>
```

### [9] CTA FINAL

Mensagem WhatsApp pre-preenchida especifica deste bairro.
Usar o texto exato do chat1-output.md para este bairro.

```html
<section class="cta-final">
  <h2>Pronto para atender voce no [Bairro]</h2>
  <p>[Frase de reforco. 1 linha. Mencionar bairro.] </p>
  <a href="https://wa.me/55[[NUMERO]]?text=[[MENSAGEM-BAIRRO-ENCODED]]"
     class="btn-whatsapp btn-whatsapp--large"
     rel="noopener">
    Falar agora no WhatsApp
  </a>
</section>
```

---

## 6. REGRAS DE UNICIDADE DE CONTEUDO

Esta e a regra mais critica do modulo.
O Google penaliza conteudo duplicado. As IAs ignoram paginas identicas.

O que deve ser IDENTICO em todas as paginas de bairro (por design):
- Estrutura HTML (ordem dos blocos)
- Servicos oferecidos
- Nome e contato do negocio
- Header e footer

O que deve ser UNICO em cada pagina de bairro:
- Title tag (contem o bairro especifico)
- Meta description (contem o bairro especifico)
- URL canonical
- H1 (contem o bairro especifico)
- AI Answer Box (versao especifica do bairro)
- Paragrafo de introducao (reescrito para cada bairro)
- Perguntas do FAQ (especificas do bairro)
- Respostas do FAQ (mencionam o bairro)
- Mensagem WhatsApp (menciona o bairro)
- Lista de "outros bairros" (exclui o bairro atual)

Tecnica para variar o paragrafo de introducao:
- Bairro 1: abordar pelo angulo da proximidade ("Morador do [Bairro], voce nao precisa...")
- Bairro 2: abordar pelo angulo do problema ("Quem mora no [Bairro] sabe que...")
- Bairro 3: abordar pelo angulo da solucao ("O [Bairro] conta com atendimento especializado...")
- Bairro 4+: variar entre esses angulos sem repetir o mesmo para bairros consecutivos

---

## 7. LINKS INTERNOS POR PAGINA DE BAIRRO

Minimo 3 links internos por pagina (excluindo header, footer e CTA WhatsApp).

Distribuicao recomendada:
- 1 link para a home (ancora descritiva, ex: "[servico] em [cidade]")
- 1 link para a pagina Sobre (ex: "nossa equipe especializada em [nicho]")
- 1+ links para outros bairros na secao "outras areas"

Ancoras proibidas: "clique aqui", "saiba mais", "acesse", "leia mais", "veja"
Ancoras corretas: descrevem o destino com keyword local quando possivel

---

## 8. GERACAO EM SEQUENCIA

Gerar uma pagina de bairro por vez.
Nao gerar multiplas paginas de bairro em uma unica execucao.

Sequencia obrigatoria:
1. Gerar a pagina do primeiro bairro da lista (maior prioridade)
2. Aguardar confirmacao
3. Gerar a pagina do segundo bairro
4. Aguardar confirmacao
5. Repetir ate completar a lista

Ao concluir cada pagina, informar:
"Pagina [nicho] em [bairro] concluida.
URL: /[slug-completo]/
Proximo: [nome do proximo bairro] ou [encerramento se for o ultimo]."

---

## 9. FOOTER — LINKS DE TODOS OS BAIRROS

O footer e gerado UMA VEZ antes das paginas de bairro.
Ele ja deve conter os links de todos os bairros da lista do chat1-output.md.

Estrutura da nav de areas no footer:

```html
<nav class="footer-areas" aria-label="Areas de atendimento em [Cidade]">
  <h3>[Nicho capitalizado] em [Cidade] por bairro</h3>
  <ul>
    <li><a href="/[nicho]-[bairro-1]-[cidade]/">[Nicho] no [Bairro 1]</a></li>
    <li><a href="/[nicho]-[bairro-2]-[cidade]/">[Nicho] no [Bairro 2]</a></li>
    <!-- um item para cada bairro da lista -->
  </ul>
</nav>
```

Regra: o footer e o unico lugar onde todos os bairros aparecem juntos em lista.
Nas paginas de bairro, a secao "outras areas" exclui o bairro atual.

---

## 10. SITEMAP — PREPARAR PARA O CHAT 3

Ao concluir todas as paginas de bairro, gerar um arquivo
projects/[cliente]-local/lista-urls.md com todas as URLs do projeto.

Formato:
```
# URLs do projeto [Nome do negocio]
# Gerado em [data]

https://[[INSERIR-DOMINIO]]/
https://[[INSERIR-DOMINIO]]/sobre/
https://[[INSERIR-DOMINIO]]/contato/
https://[[INSERIR-DOMINIO]]/[nicho]-[bairro-1]-[cidade]/
https://[[INSERIR-DOMINIO]]/[nicho]-[bairro-2]-[cidade]/
https://[[INSERIR-DOMINIO]]/[nicho]-[bairro-N]-[cidade]/
```

Este arquivo e usado pelo Chat 3 para gerar o sitemap.xml automaticamente.

---

_ZENITE GEO LOCAL FRAMEWORK™ v1.0_
_Zênite GEO — zenitegeo.com.br_
_Proibida reproducao sem autorizacao._
