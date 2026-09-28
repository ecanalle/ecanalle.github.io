const https = require("https");
const fs = require("fs");

const USERNAME = "ecanalle";
const token = process.env.GH_TOKEN;

const options = {
  hostname: "api.github.com",
  path: `/users/${USERNAME}/repos?sort=updated&per_page=20`,
  method: "GET",
  headers: {
    "User-Agent": "GitHub-Repo-Updater",
    ...(token && { Authorization: `token ${token}` }),
  },
};

const req = https.request(options, (res) => {
  let data = "";
  res.on("data", (chunk) => (data += chunk));
  res.on("end", () => {
    try {
      const repos = JSON.parse(data);

      if (!Array.isArray(repos)) {
        throw new Error(repos.message || "Resposta inesperada da API");
      }

      const projects = repos
        .filter((p) => !p.fork)
        .map((p) => ({
          name: p.name,
          description: p.description || "",
          html_url: p.html_url,
          language: p.language || "Swift",
          stargazers_count: p.stargazers_count,
          pushed_at: p.pushed_at,
        }));

      fs.writeFileSync(
        "repos.json",
        JSON.stringify({ repos: projects }, null, 2)
      );
      console.log(
        `Sucesso: repos.json atualizado com ${projects.length} projetos do GitHub.`
      );
    } catch (e) {
      console.error("Erro ao processar resposta da API:", e);
      process.exit(1);
    }
  });
});

req.on("error", (e) => {
  console.error("Erro na requisição:", e);
  process.exit(1);
});

req.end();