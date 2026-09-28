document.addEventListener('DOMContentLoaded', () => {
  // ── 1. THEME TOGGLE & PERSISTENCE ──
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

  // ── 2. DYNAMIC REPOSITORIES LOAD (repos.json) ──
  const reposGrid = document.getElementById('repos-grid');
  if (reposGrid) {
    fetch('repos.json')
      .then(response => {
        if (!response.ok) throw new Error('HTTP status ' + response.status);
        return response.json();
      })
      .then(data => {
        // Acessa a chave "repos" dentro do repos.json
        const repos = data.repos || data;

        if (!Array.isArray(repos) || repos.length === 0) {
          reposGrid.innerHTML = '<p>Nenhum repositório encontrado.</p>';
          return;
        }

        reposGrid.innerHTML = repos.map(repo => `
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
        console.error('Erro ao ler repos.json:', err);
        reposGrid.innerHTML = '<p>Não foi possível carregar os repositórios.</p>';
      });
  }
});
});
