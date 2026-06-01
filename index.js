cat > index.js <<'EOF'
const express = require("express");
const path = require("path");

const app = express();
const port = 8080;

const messages = [
  {
    author: "Coordenação",
    text: "Bem-vindos ao mural interno. Usem este espaço para avisos rápidos da turma.",
  },
  {
    author: "Monitoria",
    text: "Plantão de dúvidas hoje às 18h no laboratório 2.",
  },
];

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

function page(title, content) {
  return `
<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title} · Campus Board</title>
  <link rel="stylesheet" href="/styles.css">
</head>
<body>
  <header class="topbar">
    <a class="brand" href="/">
      <span class="brand-icon">CB</span>
      <span>
        <strong>Campus Board</strong>
        <small>Mural interno de recados</small>
      </span>
    </a>

    <nav>
      <a href="/">Início</a>
      <a href="/messages">Mural</a>
      <a href="/search?q=monitoria">Busca</a>
      <a href="/profile#Visitante">Perfil</a>
      <a href="/account">Conta</a>
    </nav>
  </header>

  <main class="container">
    ${content}
  </main>

  <footer class="footer">
    Sistema interno de comunicação acadêmica.
  </footer>
</body>
</html>
`;
}

app.get("/", (req, res) => {
  res.send(
    page(
      "Início",
      `
<section class="hero">
  <div>
    <p class="eyebrow">mural interno</p>
    <h1>Organize avisos, recados e comunicados em um só lugar.</h1>
    <p class="lead">
      O Campus Board é uma aplicação simples para publicação de mensagens, busca de avisos
      e visualização rápida de informações de usuários.
    </p>

    <div class="actions">
      <a class="button primary" href="/messages">Ver mural</a>
      <a class="button" href="/search?q=monitoria">Pesquisar avisos</a>
    </div>
  </div>

  <aside class="hero-card">
    <h2>Resumo</h2>
    <p>Mensagens recentes, busca textual e perfil de visitante para navegação rápida.</p>
    <div class="stats">
      <span><strong>${messages.length}</strong><small>avisos</small></span>
      <span><strong>3</strong><small>áreas</small></span>
      <span><strong>local</strong><small>ambiente</small></span>
    </div>
  </aside>
</section>

<section class="grid">
  <article class="card">
    <h2>Mural de mensagens</h2>
    <p>Publique recados rápidos para a turma, coordenação ou equipe de apoio.</p>
    <a href="/messages">Abrir mural</a>
  </article>

  <article class="card">
    <h2>Busca de avisos</h2>
    <p>Localize comunicados por palavra-chave e acompanhe atualizações recentes.</p>
    <a href="/search?q=aula">Pesquisar</a>
  </article>

  <article class="card">
    <h2>Perfil rápido</h2>
    <p>Use o perfil de visitante para personalizar a saudação da página.</p>
    <a href="/profile#Larissa">Abrir perfil</a>
  </article>
</section>
`
    )
  );
});

app.get("/messages", (req, res) => {
  const list = messages
    .map(
      (message) => `
<article class="message">
  <div class="message-head">
    <strong>${message.author}</strong>
    <span>agora</span>
  </div>
  <div class="message-body">
    ${message.text}
  </div>
</article>
`
    )
    .join("");

  res.send(
    page(
      "Mural",
      `
<section class="page-header">
  <p class="eyebrow">comunicados</p>
  <h1>Mural de mensagens</h1>
  <p class="lead">
    Publique avisos, lembretes e conteúdos formatados para outros usuários do ambiente.
  </p>
</section>

<section class="panel">
  <form method="POST" action="/messages" class="form">
    <div class="row">
      <label>
        Nome
        <input name="author" placeholder="Seu nome" required>
      </label>
    </div>

    <label>
      Mensagem
      <textarea name="text" rows="6" placeholder="Digite um aviso para o mural" required></textarea>
    </label>

    <button type="submit">Publicar mensagem</button>
  </form>
</section>

<section class="messages">
  ${list}
</section>
`
    )
  );
});

app.post("/messages", (req, res) => {
  messages.unshift({
    author: req.body.author || "Anônimo",
    text: req.body.text || "",
  });

  res.redirect("/messages");
});

app.get("/search", (req, res) => {
  const q = req.query.q || "";

  const results = messages
    .filter((message) => {
      const haystack = `${message.author} ${message.text}`.toLowerCase();
      return haystack.includes(String(q).toLowerCase());
    })
    .map(
      (message) => `
<article class="message compact">
  <strong>${message.author}</strong>
  <p>${message.text}</p>
</article>
`
    )
    .join("");

  res.send(
    page(
      "Busca",
      `
<section class="page-header">
  <p class="eyebrow">pesquisa</p>
  <h1>Resultados da busca</h1>
  <p class="lead">Resultados encontrados para: <strong>${q}</strong></p>
</section>

<section class="panel">
  <form method="GET" action="/search" class="search-form">
    <input name="q" value="${q}" placeholder="Pesquisar no mural">
    <button type="submit">Buscar</button>
  </form>
</section>

<section class="messages">
  ${results || `<p class="empty">Nenhum resultado encontrado para <strong>${q}</strong>.</p>`}
</section>
`
    )
  );
});

app.get("/profile", (req, res) => {
  res.send(
    page(
      "Perfil",
      `
<section class="profile-card">
  <div class="avatar">U</div>
  <div>
    <p class="eyebrow">perfil de visitante</p>
    <h1 id="visitor-name">Visitante</h1>
    <p class="lead">
      Esta página personaliza a saudação com base no identificador informado no final da URL.
    </p>
  </div>
</section>

<section class="panel">
  <h2>Como usar</h2>
  <p>Altere o trecho após <code>#</code> na URL para mudar o nome exibido no perfil.</p>
  <pre>http://localhost:8080/profile#Larissa</pre>
</section>

<script>
  const value = decodeURIComponent(location.hash.slice(1) || "Visitante");
  document.getElementById("visitor-name").innerHTML = value;
</script>
`
    )
  );
});

app.get("/account", (req, res) => {
  res.cookie("campus_session", "session-demo-12345", {
    httpOnly: false,
    sameSite: "lax",
    secure: false,
  });

  res.send(
    page(
      "Conta",
      `
<section class="page-header">
  <p class="eyebrow">área da conta</p>
  <h1>Sessão iniciada</h1>
  <p class="lead">
    Um cookie de sessão de demonstração foi criado para manter a navegação do usuário.
  </p>
</section>

<section class="panel">
  <h2>Informações da sessão</h2>
  <p>Usuário: visitante local</p>
  <p>Status: conectado</p>
</section>
`
    )
  );
});

app.listen(port, () => {
  console.log(`Campus Board vulneravel disponível em http://localhost:${port}`);
});
EOF
