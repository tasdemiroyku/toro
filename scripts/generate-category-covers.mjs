// Generates the branded category cover SVGs in public/images/categories/.
// Usage: node scripts/generate-category-covers.mjs .
// Icons come from lib/categories.js; re-run after adding a category there.
import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { CATEGORIES } from '../lib/categories.js'

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

// Line icons on a 24-unit grid, shared with the UI (components/CategoryIcon.jsx)
const ICONS = Object.fromEntries(CATEGORIES.map(c => [c.value, c.icon]))

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
