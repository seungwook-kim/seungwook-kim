// Renders assets/header-{dark,light}.svg: a terminal session plus a small animated network.
// Edit SESSION below and run `node scripts/render-header.mjs`.
import { writeFileSync } from 'node:fs';
import { THEMES, MONO, SANS, esc, windowFrame } from './theme.mjs';

const W = 1000, H = 340;
const CH = 11; // assumed monospace advance at 18px, used for the typing wipe

const NAME = 'Seungwook Kim';
const SESSION = [
  { cmd: 'whoami', y: 92, at: 0.35 },
  { out: 'name', y: 140, at: 1.1 },
  { cmd: 'cat about.txt', y: 190, at: 1.5 },
  { out: 'Full-stack dev (Java/Spring, 4y+) → AI agent developer.', y: 220, at: 2.35 },
  { cmd: 'ls ./skills', y: 264, at: 2.75 },
  { dirs: ['ai-agents/', 'llm/', 'speech/', 'vision/', 'java-spring/', 'web/'], y: 294, at: 3.5 },
];
const CURSOR = { y: 326, at: 3.95 };

// A signal pulses through the network layer by layer.
const LAYERS = [
  { x: 690, ys: [140, 190, 240], color: 'blue' },
  { x: 775, ys: [115, 165, 215, 265], color: 'green' },
  { x: 860, ys: [115, 165, 215, 265], color: 'green' },
  { x: 945, ys: [165, 215], color: 'purple' },
];
const CYCLE = 3.6, STEP = 0.5;

function sessionLines(t) {
  return SESSION.map((s) => {
    if (s.cmd) {
      const w = s.cmd.length * CH + 6;
      return `
  <g class="fade" style="animation-delay:${(s.at - 0.1).toFixed(2)}s">
    <text x="40" y="${s.y}" font-family="${MONO}" font-size="18" font-weight="700" fill="${t.green}">$</text>
  </g>
  <text x="62" y="${s.y}" font-family="${MONO}" font-size="18" fill="${t.text}">${esc(s.cmd)}</text>
  <rect x="60" y="${s.y - 20}" width="${w}" height="28" fill="${t.bg}" class="cover"
    style="--w:${w}px;animation:type ${(s.cmd.length * 0.06).toFixed(2)}s steps(${s.cmd.length}) ${s.at}s forwards"/>`;
    }
    const body = s.out === 'name'
      ? `<text x="40" y="${s.y}" font-family="${SANS}" font-size="40" font-weight="700" fill="${t.text}">${esc(NAME)}</text>`
      : s.dirs
        ? `<text x="40" y="${s.y}" font-family="${MONO}" font-size="17" font-weight="700" fill="${t.blue}">${s.dirs.map((d, i) => `<tspan${i ? ' dx="18"' : ''}>${esc(d)}</tspan>`).join('')}</text>`
        : `<text x="40" y="${s.y}" font-family="${MONO}" font-size="17" fill="${t.muted}">${esc(s.out)}</text>`;
    return `
  <g class="fade" style="animation-delay:${s.at}s">${body}</g>`;
  }).join('');
}

function network(t) {
  const edges = [], flows = [], nodes = [];
  LAYERS.forEach((L, li) => {
    const next = LAYERS[li + 1];
    if (next) {
      const paths = L.ys.flatMap((y1) => next.ys.map((y2) => `<path d="M${L.x} ${y1}L${next.x} ${y2}"/>`));
      edges.push(...paths);
      flows.push(`<g class="flow" style="animation-delay:${(li * STEP + STEP / 2).toFixed(2)}s">${paths.join('')}</g>`);
    }
    const c = t[L.color];
    for (const y of L.ys) {
      nodes.push(`<circle cx="${L.x}" cy="${y}" r="9" fill="${c}" stroke="${c}" stroke-width="2" class="pulse" style="animation-delay:${(li * STEP).toFixed(2)}s"/>`);
    }
  });
  return `
  <g class="fade" style="animation-delay:.2s">
    <text x="${(LAYERS[0].x + LAYERS.at(-1).x) / 2}" y="82" text-anchor="middle" font-family="${MONO}" font-size="13" fill="${t.muted}">model.forward(x)</text>
    <g stroke="${t.edge}" stroke-width="1.2" fill="none">${edges.join('')}</g>
    ${flows.join('\n    ')}
    ${nodes.join('\n    ')}
  </g>`;
}

function svg(t) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="title desc">
  <title id="title">${esc(NAME)}</title>
  <desc id="desc">Terminal-style header: full-stack developer (Java/Spring) moving into AI agent development.</desc>
  <style>
    .fade { opacity: 0; animation: fade .35s ease-out forwards; }
    .pulse { fill-opacity: .12; animation: pulse ${CYCLE}s ease-in-out infinite; }
    .flow { stroke: ${t.green}; stroke-width: 1.6; fill: none; stroke-opacity: 0; animation: flow ${CYCLE}s ease-in-out infinite; }
    .blink { animation: blink 1.05s steps(1) infinite; }
    @keyframes fade { to { opacity: 1; } }
    @keyframes type { to { transform: translateX(var(--w)); } }
    @keyframes pulse { 0%, 45%, 100% { fill-opacity: .12; } 18% { fill-opacity: .9; } }
    @keyframes flow { 0%, 40%, 100% { stroke-opacity: 0; } 14% { stroke-opacity: .75; } }
    @keyframes blink { 0% { opacity: 1; } 50% { opacity: 0; } }
    @media (prefers-reduced-motion: reduce) {
      .fade { opacity: 1; animation: none; }
      .cover { display: none; }
      .pulse, .flow, .blink { animation: none; }
    }
  </style>${windowFrame(t, W, H, 'seungwook-kim — ~/profile — zsh')}
${sessionLines(t)}

  <g class="fade" style="animation-delay:${CURSOR.at}s">
    <text x="40" y="${CURSOR.y}" font-family="${MONO}" font-size="18" font-weight="700" fill="${t.green}">$</text>
    <rect class="blink" x="62" y="${CURSOR.y - 17}" width="10" height="21" fill="${t.text}"/>
  </g>
${network(t)}
</svg>
`;
}

for (const [name, theme] of Object.entries(THEMES)) {
  writeFileSync(new URL(`../assets/header-${name}.svg`, import.meta.url), svg(theme));
}
console.log('header rendered');
