// Rewrites the project table in README.md with the owner's public repos, newest first.
// Runs in GitHub Actions (see .github/workflows/profile.yml); also runnable locally with `node`.
import { readFile, writeFile } from 'node:fs/promises';

const OWNER = process.env.GITHUB_REPOSITORY_OWNER || 'seungwook-kim';
const README = new URL('../README.md', import.meta.url);
const START = '<!--PROJECTS:START-->';
const END = '<!--PROJECTS:END-->';

// [badge color, simple-icons slug]
const LANGS = {
  Python: ['3776AB', 'python'],
  'Jupyter Notebook': ['F37626', 'jupyter'],
  JavaScript: ['F7DF1E', 'javascript'],
  TypeScript: ['3178C6', 'typescript'],
  HTML: ['E34F26', 'html5'],
  Shell: ['4EAA25', 'gnubash'],
  Go: ['00ADD8', 'go'],
  Rust: ['000000', 'rust'],
  'C++': ['00599C', 'cplusplus'],
};

const headers = {
  Accept: 'application/vnd.github+json',
  'User-Agent': `${OWNER}-profile-readme`,
  ...(process.env.GITHUB_TOKEN && { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }),
};

async function fetchRepos() {
  const repos = [];
  for (let page = 1; ; page++) {
    const res = await fetch(`https://api.github.com/users/${OWNER}/repos?type=owner&per_page=100&page=${page}`, { headers });
    if (!res.ok) throw new Error(`GitHub API ${res.status}: ${await res.text()}`);
    const batch = await res.json();
    repos.push(...batch);
    if (batch.length < 100) return repos;
  }
}

const kst = (iso) => new Date(iso).toLocaleDateString('sv-SE', { timeZone: 'Asia/Seoul' });
const cell = (s) => (s || '').replace(/\|/g, '\\|').replace(/\s+/g, ' ').trim();

function langBadge(lang) {
  if (!lang) return '—';
  const [color, logo] = LANGS[lang] ?? ['6e7781', ''];
  const label = encodeURIComponent(lang.replace(/-/g, '--'));
  const logoParam = logo ? `&logo=${logo}&logoColor=white` : '';
  return `<img src="https://img.shields.io/badge/${label}-${color}?style=flat-square${logoParam}" alt="${lang}">`;
}

function table(repos) {
  const rows = repos.map((r) =>
    `| [**${r.name}**](${r.html_url}) | ${cell(r.description) || '—'} | ${langBadge(r.language)} | ${kst(r.created_at)} | ${kst(r.pushed_at)} |`);
  return [
    '| Project | Description | Lang | Started | Last push |',
    '| :-- | :-- | :-: | :-: | :-: |',
    ...rows,
  ].join('\n');
}

const repos = (await fetchRepos())
  .filter((r) => !r.fork && !r.private && r.name.toLowerCase() !== OWNER.toLowerCase())
  .sort((a, b) => b.created_at.localeCompare(a.created_at));

const readme = await readFile(README, 'utf8');
const pattern = new RegExp(`${START}[\\s\\S]*?${END}`);
if (!pattern.test(readme)) throw new Error('project markers not found in README.md');

const next = readme.replace(pattern, `${START}\n${table(repos)}\n${END}`);
if (next === readme) {
  console.log('project table unchanged');
} else {
  await writeFile(README, next);
  console.log(`project table updated (${repos.length} repos)`);
}
