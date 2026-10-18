/**
 * lib/categories.js
 *
 * Single source of truth for listing taxonomy constants.
 * Import from here — never redefine locally in components.
 *
 * Rules:
 *  - `value`  → stored in the database. Treat as permanent.
 *              Adding or renaming one needs a migration
 *              updating listings_category_check (see supabase/migrations).
 *  - `label`  → display text only. Safe to change at any time.
 *  - `examples` → one-line hint shown on the home page category tiles.
 *  - `icon`   → line-icon paths on a 24-unit grid (stroke, no fill), rendered by
 *              components/CategoryIcon.jsx.
 *  - Adding a category needs this file and a migration; a price type the same.
 */

// ─── Listing Categories ───────────────────────────────────────────────────────

export const CATEGORIES = [
  {
    value: 'tutoring',
    label: 'Tutoring',
    examples: 'Maths, physics, coding, exam prep',
    icon: [
      'M22 10 12 5 2 10l10 5 10-5Z',
      'M6 12v5c3 3 9 3 12 0v-5',
      'M22 10v6',
    ],
  },
  {
    value: 'cleaning',
    label: 'Cleaning',
    examples: 'Flats, end-of-lease, weekly cleans',
    icon: [
      'M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9Z',
      'M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8Z',
      'M5 2l.6 1.4L7 4l-1.4.6L5 6l-.6-1.4L3 4l1.4-.6Z',
    ],
  },
  {
    value: 'consular',
    label: 'Paperwork & Bureaucracy',
    examples: 'Permesso, codice fiscale, residenza',
    icon: [
      'M7 3h7l5 5v13H7Z',
      'M14 3v5h5',
      'M10 13h6',
      'M10 17h4',
    ],
  },
  {
    value: 'elderly_care',
    label: 'Elderly Care',
    examples: 'Company, errands, short walks',
    icon: [
      'M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z',
      'M9 11h1.5l1-2 1.5 4 1-2H15',
    ],
  },
  {
    value: 'moving',
    label: 'Moving & Delivery',
    examples: 'Boxes, furniture, IKEA runs',
    icon: [
      'M3 7.5 12 3l9 4.5v9L12 21l-9-4.5Z',
      'M3 7.5 12 12l9-4.5',
      'M12 12v9',
      'M7.5 5.25 16.5 9.75',
    ],
  },
  {
    value: 'tech_help',
    label: 'Tech Help',
    examples: 'Laptops, Wi-Fi, printers, setup',
    icon: [
      'M5 5h14v10H5Z',
      'M2 19h20',
      'M10 9l-2 1 2 1',
      'M14 9l2 1-2 1',
    ],
  },
  {
    value: 'language_exchange',
    label: 'Language Exchange',
    examples: 'Tandems and conversation practice',
    icon: [
      'M3 4h11v8H8l-3 3v-3H3Z',
      'M17 9h4v8h-2v3l-3-3h-6v-2',
      'M6 8h5',
    ],
  },
  {
    value: 'pet_care',
    label: 'Pet Care',
    examples: 'Pet sitting and dog walking',
    icon: [
      'M12 13c-2.8 0-5 2.2-5 4.5 0 1.4 1.1 2.5 2.5 2.5.9 0 1.6-.4 2.5-.4s1.6.4 2.5.4c1.4 0 2.5-1.1 2.5-2.5 0-2.3-2.2-4.5-5-4.5Z',
      'M4.0 11.5a1.5 1.5 0 1 0 3.0 0a1.5 1.5 0 1 0 -3.0 0',
      'M7.5 7.5a1.5 1.5 0 1 0 3.0 0a1.5 1.5 0 1 0 -3.0 0',
      'M13.5 7.5a1.5 1.5 0 1 0 3.0 0a1.5 1.5 0 1 0 -3.0 0',
      'M17.0 11.5a1.5 1.5 0 1 0 3.0 0a1.5 1.5 0 1 0 -3.0 0',
    ],
  },
  {
    value: 'translation',
    label: 'Translation & Proofreading',
    examples: 'CVs, theses, official documents',
    icon: [
      'M3 5h8',
      'M7 3v2',
      'M10 5c-.5 3-2.5 6-6 8',
      'M5.5 8.5c1 2 2.5 3.5 4.5 4.5',
      'M13 21l4-10 4 10',
      'M14.5 17.5h5',
    ],
  },
  {
    value: 'design_media',
    label: 'Design & Media',
    examples: 'Graphics, photos, video editing',
    icon: [
      'M4 8h3l2-3h6l2 3h3v11H4Z',
      'M8.5 13.5a3.5 3.5 0 1 0 7.0 0a3.5 3.5 0 1 0 -7.0 0',
    ],
  },
]

/**
 * Quick O(1) lookup: category value → display label.
 * e.g. CATEGORY_LABEL['tech_help'] → 'Tech Help'
 * Falls back gracefully — if a value isn't found, show the raw value.
 */
export const CATEGORY_LABEL = Object.fromEntries(
  CATEGORIES.map(c => [c.value, c.label])
)

/** Quick O(1) lookup: category value → icon paths */
export const CATEGORY_ICON = Object.fromEntries(
  CATEGORIES.map(c => [c.value, c.icon])
)

// ─── Price Types ──────────────────────────────────────────────────────────────

/**
 * How a listing price is denominated.
 *  - `value`  → stored in the database. Treat as permanent.
 *  - `label`  → shown in dropdowns and listing cards.
 *
 * The 'free' entry is special: components should set price = 0
 * and disable the price input when this is selected.
 */
export const PRICE_TYPES = [
  { value: 'hour',    label: 'per hour' },
  { value: 'session', label: 'per session' },
  { value: 'day',     label: 'per day' },
  { value: 'fixed',   label: 'fixed price' },
  { value: 'free',    label: 'free' },
]

/**
 * Quick O(1) lookup: price type value → display label.
 * e.g. PRICE_TYPE_LABEL['hour'] → 'per hour'
 */
export const PRICE_TYPE_LABEL = Object.fromEntries(
  PRICE_TYPES.map(p => [p.value, p.label])
)