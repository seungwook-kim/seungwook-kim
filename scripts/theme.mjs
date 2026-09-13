// Shared palette for the generated SVGs; mirrors GitHub's own light/dark colors.
export const THEMES = {
  dark: {
    bg: '#0d1117', bar: '#161b22', border: '#30363d', text: '#e6edf3', muted: '#8b949e',
    green: '#7ee787', blue: '#79c0ff', purple: '#d2a8ff', yellow: '#e3b341', edge: '#30363d',
  },
  light: {
    bg: '#ffffff', bar: '#f6f8fa', border: '#d0d7de', text: '#1f2328', muted: '#59636e',
    green: '#1a7f37', blue: '#0969da', purple: '#8250df', yellow: '#9a6700', edge: '#d0d7de',
  },
};

export const MONO = `ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace`;
export const SANS = `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', 'Apple SD Gothic Neo', 'Malgun Gothic', Helvetica, Arial, sans-serif`;

export const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Rounded terminal window: background, title bar with traffic lights, border.
export function windowFrame(t, W, H, title) {
  return `
  <defs>
    <clipPath id="card"><rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="14"/></clipPath>
  </defs>
  <g clip-path="url(#card)">
    <rect width="${W}" height="${H}" fill="${t.bg}"/>
    <rect width="${W}" height="44" fill="${t.bar}"/>
    <path d="M0 44.5H${W}" stroke="${t.border}"/>
  </g>
  <rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="14" fill="none" stroke="${t.border}" stroke-width="1.5"/>
  <circle cx="26" cy="22" r="6.5" fill="#ff5f57"/>
  <circle cx="48" cy="22" r="6.5" fill="#febc2e"/>
  <circle cx="70" cy="22" r="6.5" fill="#28c840"/>
  <text x="${W / 2}" y="27" text-anchor="middle" font-family="${MONO}" font-size="13" fill="${t.muted}">${esc(title)}</text>`;
}
