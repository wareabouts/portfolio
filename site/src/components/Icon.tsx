import type { IconDefinition } from '@fortawesome/free-solid-svg-icons'

/**
 * One inline SVG per icon, drawn from the Font Awesome Free data packages.
 *
 * No runtime, no stylesheet, no flash of oversized glyphs before CSS loads: the path data
 * is imported per icon and tree-shaken, and sizing is `1em` so an icon follows the text
 * next to it. Icons are CC BY 4.0, https://fontawesome.com/license/free.
 */
export default function Icon({ icon, className }: { icon: IconDefinition; className?: string }) {
  const [w, h, , , d] = icon.icon
  const paths = Array.isArray(d) ? d : [d]
  return (
    <svg
      className={className ? `icon ${className}` : 'icon'}
      viewBox={`0 0 ${w} ${h}`}
      width="1em"
      height="1em"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      {paths.map((p, i) => (
        <path key={i} d={p} />
      ))}
    </svg>
  )
}
