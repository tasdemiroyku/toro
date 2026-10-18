// Generates the branded category cover SVGs in public/images/categories/.
// Usage: node scripts/generate-category-covers.mjs .
// Add an entry to ICONS when a category is added to lib/categories.js.
import { readFileSync, writeFileSync, mkdirSync } from 'fs'

const root = process.argv[2] ?? '.'
const outDir = `${root}/public/images/categories`
mkdirSync(outDir, { recursive: true })

const DARK = '#132600'
const DARK_2 = '#1f3d00'
const GOLD = '#C9963E'

// Toret bull watermark, taken from components/ToretBull.jsx
const bullSrc = readFileSync(`${root}/components/ToretBull.jsx`, 'utf8')
const bullPaths = [...bullSrc.matchAll(/<path([^>]*?)\/>/g)].map(([, attrs]) =>
  '<path' + attrs
    .replace(/strokeWidth=/g, 'stroke-width=')
    .replace(/strokeLinejoin=/g, 'stroke-linejoin=')
    .replace(/strokeLinecap=/g, 'stroke-linecap=')
    .replace(/fillRule=/g, 'fill-rule=')
    .replace(/clipRule=/g, 'clip-rule=')
    .replace(/currentColor/g, GOLD) + '/>'
).join('')

// Line icons on a 24-unit grid
const ICONS = {
  tutoring: [
    'M22 10 12 5 2 10l10 5 10-5Z',
    'M6 12v5c3 3 9 3 12 0v-5',
    'M22 10v6',
  ],
  cleaning: [
    'M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9Z',
    'M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8Z',
    'M5 2l.6 1.4L7 4l-1.4.6L5 6l-.6-1.4L3 4l1.4-.6Z',
  ],
  consular: [
    'M7 3h7l5 5v13H7Z',
    'M14 3v5h5',
    'M10 13h6',
    'M10 17h4',
  ],
  elderly_care: [
    'M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z',
    'M9 11h1.5l1-2 1.5 4 1-2H15',
  ],
  moving: [
    'M3 7.5 12 3l9 4.5v9L12 21l-9-4.5Z',
    'M3 7.5 12 12l9-4.5',
    'M12 12v9',
    'M7.5 5.25 16.5 9.75',
  ],
  tech_help: [
    'M5 5h14v10H5Z',
    'M2 19h20',
    'M10 9l-2 1 2 1',
    'M14 9l2 1-2 1',
  ],
  language_exchange: [
    'M3 4h11v8H8l-3 3v-3H3Z',
    'M17 9h4v8h-2v3l-3-3h-6v-2',
    'M6 8h5',
  ],
}

function cover(icon) {
  const iconPaths = icon.map(d => `<path d="${d}"/>`).join('')
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice">
<defs>
<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${DARK_2}"/><stop offset="1" stop-color="${DARK}"/></linearGradient>
<radialGradient id="glow" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="${GOLD}" stop-opacity="0.18"/><stop offset="1" stop-color="${GOLD}" stop-opacity="0"/></radialGradient>
<pattern id="dots" width="28" height="28" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.4" fill="${GOLD}" fill-opacity="0.12"/></pattern>
</defs>
<rect width="800" height="600" fill="url(#bg)"/>
<rect width="800" height="600" fill="url(#dots)"/>
<circle cx="400" cy="300" r="230" fill="url(#glow)"/>
<circle cx="400" cy="300" r="150" fill="none" stroke="${GOLD}" stroke-opacity="0.25" stroke-width="2"/>
<g transform="translate(280 180) scale(10)" fill="none" stroke="${GOLD}" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round">${iconPaths}</g>
<g transform="translate(610 430) scale(0.36)" opacity="0.14">${bullPaths}</g>
</svg>
`
}

for (const [name, icon] of Object.entries(ICONS)) {
  writeFileSync(`${outDir}/${name}.svg`, cover(icon))
}
console.log('wrote', Object.keys(ICONS).length, 'covers to', outDir)
