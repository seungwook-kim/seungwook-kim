// Renders assets/journey-{dark,light}.svg from data/journey.json as a `git log --graph` view.
// Entries are newest first; add new ones at the top. `"status": "wip"` marks work in progress.
import { readFileSync, writeFileSync } from 'node:fs';
import { THEMES, MONO, SANS, esc, windowFrame } from './theme.mjs';

const entries = JSON.parse(readFileSync(new URL('../data/journey.json', import.meta.url), 'utf8'));

const W = 1000, TOP = 68, ROW = 56, LANE = 48;
const H = TOP + entries.length * ROW + 8;
const cy = (i) => TOP + i * ROW + 16;

function svg(t) {
  const last = entries.length - 1;
  const rows = entries.map((e, i) => {
    const y = cy(i);
    const wip = e.status === 'wip';
    const dot = wip
      ? `<circle cx="${LANE}" cy="${y}" r="7" fill="${t.bg}" stroke="${t.blue}" stroke-width="2.5"/>
    <circle cx="${LANE}" cy="${y}" r="7" fill="none" stroke="${t.blue}" stroke-width="2" class="ring"/>`
      : `<circle cx="${LANE}" cy="${y}" r="7" fill="${t.green}"/>`;
    const tag = wip
      ? `
    <rect x="${W - 150}" y="${y - 13}" width="110" height="26" rx="13" fill="none" stroke="${t.blue}"/>
    <text x="${W - 95}" y="${y + 5}" text-anchor="middle" font-family="${MONO}" font-size="13" fill="${t.blue}">in progress</text>`
      : '';
    return `
  <g class="row" style="animation-delay:${(0.15 + i * 0.12).toFixed(2)}s">
    ${dot}
    <text x="78" y="${y + 5}" font-family="${MONO}" font-size="15" fill="${wip ? t.blue : t.yellow}">${esc(e.date)}</text>
    <text x="178" y="${y + 6}" font-family="${SANS}" font-size="17" font-weight="700" fill="${t.text}">${esc(e.title)}</text>
    <text x="380" y="${y + 6}" font-family="${SANS}" font-size="15" fill="${t.muted}">${esc(e.detail)}</text>${tag}
  </g>`;
  }).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="title desc">
  <title id="title">Learning journey</title>
  <desc id="desc">${esc(entries.map((e) => `${e.date} ${e.title}: ${e.detail}`).join('; '))}</desc>
  <style>
    .row { opacity: 0; animation: rise .45s ease-out forwards; }
    .ring { transform-box: fill-box; transform-origin: center; animation: ring 2s ease-out infinite; }
    @keyframes rise { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
    @keyframes ring { 0% { opacity: .7; transform: scale(1); } 100% { opacity: 0; transform: scale(2.4); } }
    @media (prefers-reduced-motion: reduce) {
      .row { opacity: 1; animation: none; }
      .ring { animation: none; opacity: 0; }
    }
  </style>${windowFrame(t, W, H, '~/profile — git log --graph --oneline')}
  <path d="M${LANE} ${cy(0)}V${cy(last)}" stroke="${t.edge}" stroke-width="2"/>
${rows}
</svg>
`;
}

for (const [name, theme] of Object.entries(THEMES)) {
  writeFileSync(new URL(`../assets/journey-${name}.svg`, import.meta.url), svg(theme));
}
console.log(`journey rendered (${entries.length} entries)`);
