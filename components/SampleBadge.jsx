// Marks demo listings (listings.is_sample) so visitors know they are previews
export default function SampleBadge({ className = '' }) {
  return (
    <span
      title="Sample listing shown while Toro is in preview"
      className={`text-[10px] font-semibold uppercase tracking-[0.1em] text-toro-dark/65 bg-toro-dark/5 px-2 py-1 rounded-lg ${className}`}
    >
      Sample
    </span>
  )
}
