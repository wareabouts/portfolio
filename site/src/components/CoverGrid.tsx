import { useRef } from 'react'
import { Link } from 'react-router-dom'
import type { Doc } from '../types'
import { coverSrc } from '../content'

export default function CoverGrid({ items }: { items: Doc[] }) {
  return (
    <div className="covers">
      {items.map((p) => (
        <Cover key={p.slug} project={p} />
      ))}
    </div>
  )
}

function Cover({ project }: { project: Doc }) {
  const img = project.cover ? coverSrc(project.cover) : null
  const ref = useRef<HTMLImageElement>(null)

  // The grid ships static posters; the animation loads only when a cover is hovered,
  // which keeps the landing page light without losing the animated covers entirely.
  const play = () => {
    if (img?.animSrc && ref.current) ref.current.src = img.animSrc
  }
  const stop = () => {
    if (img?.animSrc && ref.current) ref.current.src = img.src
  }

  return (
    <Link
      className="cover"
      to={`/${project.slug}`}
      onMouseEnter={play}
      onMouseLeave={stop}
      onFocus={play}
      onBlur={stop}
    >
      <div className="cover-img">
        {img && (
          <img
            ref={ref}
            src={img.src}
            alt={project.title}
            width={img.width}
            height={img.height}
            loading="lazy"
            decoding="async"
          />
        )}
      </div>
      <div className="cover-title">{project.title}</div>
      {project.year && <div className="cover-year">{project.year}</div>}
    </Link>
  )
}
