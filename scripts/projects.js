// Fetch and render GitHub repositories into #all-repos-grid
// Include this file in index.html with: <script src="scripts/projects.js" defer></script>
(function () {
  const GITHUB_USER = 'LINWOO0099';
  const containerSelector = '#all-repos-grid';
  const PER_PAGE = 100;

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  async function fetchAllRepos() {
    let repos = [];
    let url = `https://api.github.com/users/${GITHUB_USER}/repos?per_page=${PER_PAGE}&sort=updated`;

    try {
      while (url) {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
        const page = await res.json();
        repos = repos.concat(page);

        const link = res.headers.get('link');
        if (link) {
          const nextMatch = link.match(/<([^>]*)>; rel="next"/);
          url = nextMatch ? nextMatch[1] : null;
        } else {
          url = null;
        }
      }
    } catch (err) {
      console.error('Failed to fetch repos', err);
      throw err;
    }

    return repos;
  }

  function createProjectCard(repo) {
    const card = document.createElement('article');
    card.className = 'project-card';

    const languages = repo.language ? `<span>${escapeHtml(repo.language)}</span>` : '';

    card.innerHTML = `
      <div class="project-image" aria-hidden="true">
        <div class="placeholder">${escapeHtml(repo.name)}</div>
      </div>
      <div class="project-content">
        <h3><a class="project-link" href="${repo.html_url}" target="_blank" rel="noopener noreferrer">${escapeHtml(repo.name)}</a></h3>
        <p>${escapeHtml(repo.description || '')}</p>
        <div class="project-tech">${languages}</div>
        <a class="project-link" href="${repo.html_url}" target="_blank" rel="noopener noreferrer">View on GitHub</a>
      </div>
    `;

    return card;
  }

  function showMessage(container, message) {
    container.innerHTML = `<p class="placeholder">${escapeHtml(message)}</p>`;
  }

  async function init() {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    showMessage(container, 'Loading repositories...');

    let repos = [];
    try {
      repos = await fetchAllRepos();
    } catch (err) {
      showMessage(container, 'Could not load repositories from GitHub.');
      return;
    }

    if (!repos || repos.length === 0) {
      showMessage(container, 'No repositories found.');
      return;
    }

    // Optionally filter: e.g., exclude empty repos or the portfolio itself
    const filtered = repos
      // .filter(r => r.size > 0) // uncomment to skip empty repos
      .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

    container.innerHTML = '';

    filtered.forEach(repo => {
      const card = createProjectCard(repo);
      container.appendChild(card);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
