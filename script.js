function initTheme() {
  let theme = localStorage.getItem("theme");
  if (!theme) {
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    theme = prefersDark ? "dark" : "light";
  }
  setTheme(theme);
}

function setTheme(theme) {
  if (theme === "dark") {
    document.documentElement.classList.add("dark-mode");
  } else {
    document.documentElement.classList.remove("dark-mode");
  }
  localStorage.setItem("theme", theme);
}

function toggleTheme() {
  const currentTheme = localStorage.getItem("theme") || "light";
  const newTheme = currentTheme === "dark" ? "light" : "dark";
  setTheme(newTheme);
}

window.addEventListener("DOMContentLoaded", function () {
  const btn = document.getElementById("theme-toggle");
  if (btn) {
    btn.addEventListener("click", toggleTheme);
  }
});

window
  .matchMedia("(prefers-color-scheme: dark)")
  .addEventListener("change", (e) => {
    if (!localStorage.getItem("theme")) {
      setTheme(e.matches ? "dark" : "light");
    }
  });

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("visible");
        observer.unobserve(e.target);
      }
    });
  },
  { threshold: 0.12 },
);
document.querySelectorAll(".fade-up").forEach((el) => observer.observe(el));

const GITHUB_USER = "ecanalle";
const LANG_COLORS = {
  Swift: "#0071e3",
  JavaScript: "#f1e05a",
  TypeScript: "#3178c6",
  Python: "#3572A5",
  HTML: "#e34c26",
  CSS: "#563d7c",
  "Objective-C": "#438eff",
  Ruby: "#701516",
  default: "#8b949e",
};

function relativeDate(dateStr) {
  const diff = Date.now() - new Date(dateStr);
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

async function loadRepos() {
  const container = document.getElementById("repos-container");
  const statusEl = document.getElementById("gh-status");
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const res = await fetch("./repos.json", {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) throw new Error("Failed to load repos");
    const data = await res.json();

    const repos = Array.isArray(data) ? data : data.repos || [];

    if (repos.length === 0) {
      container.innerHTML = `<div class="repos-empty">No public projects found on GitHub yet.</div>`;
      return;
    }

    statusEl.textContent = "connected";
    statusEl.className = "project-status live";

    const html = `<div class="repos-grid">${repos
      .map((repo, i) => {
        const langColor = LANG_COLORS[repo.language] || LANG_COLORS.default;
        const repoUrl = repo.html_url;
        const lastPush = repo.pushed_at;

        return `
        <a href="${repoUrl}" target="_blank" rel="noopener" class="repo-card" style="animation-delay:${i * 0.06}s">
          <div class="repo-header">
            <div class="repo-name">📁 ${repo.name}</div>
            <div class="repo-visibility">public</div>
          </div>
          <div class="repo-desc">${repo.description || '<span style="color:var(--text-muted);font-style:italic">No description</span>'}</div>
          <div class="repo-meta">
            ${repo.language ? `<div class="repo-lang"><div class="lang-dot" style="background:${langColor}"></div>${repo.language}</div>` : ""}
            <div class="repo-updated">updated ${relativeDate(lastPush)}</div>
            <div class="repo-stars">⭐ ${repo.stargazers_count || 0}</div>
          </div>
        </a>`;
      })
      .join("")}</div>`;
    container.innerHTML = html;
  } catch (err) {
    statusEl.textContent = "error loading";
    statusEl.className = "project-status error";
    console.error("Error loading repos:", err);
    container.innerHTML = `<div class="repos-error">Could not load projects.<br/>See directly at <a href="https://github.com/${GITHUB_USER}" target="_blank" style="color:var(--accent)">github.com/${GITHUB_USER}</a></div>`;
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", loadRepos);
} else {
  loadRepos();
}