// Rewrites the project table in README.md with the owner's public repos, newest first.
// Runs in GitHub Actions (see .github/workflows/profile.yml); also runnable locally with `node`.
import { readFile, writeFile } from 'node:fs/promises';

const OWNER = process.env.GITHUB_REPOSITORY_OWNER || 'seungwook-kim';
const README = new URL('../README.md', import.meta.url);
const START = '<!--PROJECTS:START-->';
const END = '<!--PROJECTS:END-->';

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

// Dotted dates don't wrap inside narrow table cells the way hyphenated ones do.
const kst = (iso) => new Date(iso).toLocaleDateString('sv-SE', { timeZone: 'Asia/Seoul' }).replaceAll('-', '.');
const cell = (s) => (s || '').replace(/\|/g, '\\|').replace(/\s+/g, ' ').trim();

function table(repos) {
  const rows = repos.map((r) => {
    const archived = r.archived ? ' <sub>`archived`</sub>' : '';
    return `| [**${r.name}**](${r.html_url})${archived} | ${cell(r.description) || '—'} | ${kst(r.created_at)} |`;
  });
  return [
    '| Project | Description | Started |',
    '| :-- | :-- | :-: |',
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
