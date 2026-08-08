import { useCallback, useEffect } from 'react'
import { imageSrc } from '../content'

export interface LightboxItem {
  asset: string
  caption?: string
  /** 'dark' marks line art drawn for a light ground. */
  invert?: string
}

interface Props {
  items: LightboxItem[]
  index: number
  onClose: () => void
  onIndex: (i: number) => void
}

export default function Lightbox({ items, index, onClose, onIndex }: Props) {
  const many = items.length > 1
  const step = useCallback(
    (d: number) => onIndex((index + d + items.length) % items.length),
    [index, items.length, onIndex],
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowRight' && many) step(1)
      else if (e.key === 'ArrowLeft' && many) step(-1)
    }
    document.addEventListener('keydown', onKey)
    // Stop the page scrolling behind the overlay.
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [onClose, step, many])

  const item = items[index]
  if (!item) return null
  const img = imageSrc(item.asset, '94vw')

  return (
    <div
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={item.caption || 'Image viewer'}
      onClick={onClose}
    >
      <img
        className={item.invert === 'dark' ? 'invert-dark' : undefined}
        src={img.src}
        srcSet={img.srcSet}
        sizes="94vw"
        alt={item.caption || ''}
        onClick={(e) => e.stopPropagation()}
      />
      <button className="lightbox-close" onClick={onClose} aria-label="Close">
        ×
      </button>
      {many && (
        <>
          <button
            className="lightbox-nav prev"
            aria-label="Previous image"
            onClick={(e) => {
              e.stopPropagation()
              step(-1)
            }}
          >
            ‹
          </button>
          <button
            className="lightbox-nav next"
            aria-label="Next image"
            onClick={(e) => {
              e.stopPropagation()
              step(1)
            }}
          >
            ›
          </button>
        </>
      )}
      {item.caption && <div className="lightbox-caption">{item.caption}</div>}
    </div>
  )
}
