document.addEventListener('DOMContentLoaded', () => {
  // ── 1. THEME TOGGLE & PERSISTENCE (Não faz fetch nem recarrega repos) ──
  const themeToggleBtn = document.getElementById('theme-toggle');
  const html = document.documentElement;

  let savedTheme = null;
  try {
    savedTheme = localStorage.getItem('theme');
  } catch (e) {
    console.warn('localStorage indisponível:', e);
  }

  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  if (savedTheme === 'dark-mode' || savedTheme === 'light-mode') {
    html.classList.add(savedTheme);
  } else if (systemPrefersDark) {
    html.classList.add('dark-mode');
  } else {
    html.classList.add('light-mode');
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const isDark = html.classList.contains('dark-mode');

      if (isDark) {
        html.classList.remove('dark-mode');
        html.classList.add('light-mode');
        try { localStorage.setItem('theme', 'light-mode'); } catch (e) {}
      } else {
        html.classList.remove('light-mode');
        html.classList.add('dark-mode');
        try { localStorage.setItem('theme', 'dark-mode'); } catch (e) {}
      }
    });
  }

  // ── 2. DYNAMIC REPOSITORIES LOAD (Executa EXATAMENTE UMA VEZ no carregamento) ──
  const reposGrid = document.getElementById('repos-grid');
  if (reposGrid) {
    fetch('https://api.github.com/users/ecanalle/repos?sort=updated&per_page=6')
      .then(response => {
        if (!response.ok) throw new Error('Erro na API do GitHub');
        return response.json();
      })
      .then(repos => {
        const ownRepos = repos.filter(repo => !repo.fork);

        if (ownRepos.length === 0) {
          reposGrid.innerHTML = '<p>Nenhum repositório público encontrado.</p>';
          return;
        }

        reposGrid.innerHTML = ownRepos.map(repo => `
          <a href="${repo.html_url}" target="_blank" class="repo-card">
            <div class="repo-header">
              <span class="repo-name">${repo.name}</span>
            </div>
            <p class="repo-desc">${repo.description || 'Sem descrição informada.'}</p>
            <div class="repo-meta">
              ${repo.language ? `<span><span class="lang-dot"></span>${repo.language}</span>` : ''}
              <span>★ ${repo.stargazers_count || 0}</span>
            </div>
          </a>
        `).join('');
      })
      .catch(err => {
        console.warn('Erro ao carregar repositórios:', err);
        reposGrid.innerHTML = '<p>Não foi possível carregar os repositórios no momento.</p>';
      });
  }
});
});
