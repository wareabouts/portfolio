import { useEffect, useRef } from 'react'
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
  const animSrc = img?.animSrc

  /**
   * Animated covers play on their own, but only once the tile is near the viewport.
   *
   * Loading all 43 animations up front costs ~5 MB; this ships static posters and swaps
   * in the animation as you scroll, so the landing page stays light while every cover
   * still animates without interaction.
   */
  useEffect(() => {
    const el = ref.current
    if (!animSrc || !el) return

    if (typeof IntersectionObserver === 'undefined') {
      el.src = animSrc
      return
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          el.src = animSrc
          io.disconnect() // one-way: never swap back to the poster
        }
      },
      { rootMargin: '200px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [animSrc])

  return (
    <Link className="cover" to={`/${project.slug}`}>
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
