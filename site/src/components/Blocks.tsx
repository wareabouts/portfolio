import { useState } from 'react'
import type { Block } from '../types'
import { aspect, asset, imageSrc, videoSrc } from '../content'
import Lightbox, { type LightboxItem } from './Lightbox'

const CONTACT_ENDPOINT = import.meta.env.VITE_CONTACT_ENDPOINT as string | undefined
const EMAIL = 'alex@alexfiel.com'

/** Every zoomable image on the page, in document order, so the lightbox can page through. */
function collectZoomable(blocks: Block[], out: LightboxItem[] = []): LightboxItem[] {
  for (const b of blocks) {
    if (b.type === 'figure') out.push({ asset: b.asset, caption: b.caption, invert: b.invert })
    else if (b.type === 'gallery') out.push(...b.items)
    else if (b.type === 'columns') b.columns.forEach((c) => collectZoomable(c, out))
  }
  return out
}

/** Class marking art that should flip in dark mode. */
const invertClass = (invert?: string) => (invert === 'dark' ? 'invert-dark' : undefined)

export default function Blocks({ blocks }: { blocks: Block[] }) {
  const [zoom, setZoom] = useState<number | null>(null)
  const zoomable = collectZoomable(blocks)
  const indexOf = (id: string) => zoomable.findIndex((z) => z.asset === id)

  return (
    <>
      <div className="blocks">
        {blocks.map((b, i) => (
          <BlockView key={i} block={b} onZoom={(id) => setZoom(indexOf(id))} />
        ))}
      </div>
      {zoom !== null && zoom >= 0 && (
        <Lightbox items={zoomable} index={zoom} onClose={() => setZoom(null)} onIndex={setZoom} />
      )}
    </>
  )
}

function BlockView({ block, onZoom }: { block: Block; onZoom: (id: string) => void }) {
  switch (block.type) {
    case 'heading':
      return <h2 className="block-heading">{block.text}</h2>

    case 'prose':
      // Sanitised at build time: the HTML comes from our own Markdown, not user input.
      return <div className="prose" dangerouslySetInnerHTML={{ __html: block.html }} />

    case 'figure': {
      const img = imageSrc(block.asset, '(max-width: 820px) 100vw, 806px')
      const a = asset(block.asset)
      return (
        <figure className={invertClass(block.invert)}>
          <button className="figure-btn" onClick={() => onZoom(block.asset)} aria-label="Enlarge image">
            <img
              src={img.src}
              srcSet={img.srcSet}
              sizes={img.sizes}
              width={img.width ?? undefined}
              height={img.height ?? undefined}
              alt={block.caption || a?.alt || ''}
              loading="lazy"
              decoding="async"
            />
          </button>
          {block.caption && <figcaption>{block.caption}</figcaption>}
        </figure>
      )
    }

    case 'gallery':
      return (
        <div className="gallery">
          {block.items.map((it) => {
            const img = imageSrc(it.asset, '(max-width: 820px) 50vw, 400px')
            const ar = aspect(it.asset)
            return (
              // flex-grow by aspect ratio → rows fill the width, proportions preserved
              <figure
                className={['gallery-item', invertClass(it.invert)].filter(Boolean).join(' ')}
                key={it.asset}
                style={{ flexGrow: ar * 100, flexBasis: `${ar * 180}px`, aspectRatio: ar }}
              >
                <button onClick={() => onZoom(it.asset)} aria-label="Enlarge image">
                  <img
                    src={img.src}
                    srcSet={img.srcSet}
                    sizes={img.sizes}
                    alt={it.caption || ''}
                    loading="lazy"
                    decoding="async"
                  />
                </button>
                {it.caption && <figcaption className="gallery-caption">{it.caption}</figcaption>}
              </figure>
            )
          })}
        </div>
      )

    case 'embed': {
      if (block.provider === 'iframe') {
        return (
          <div className="embed" style={{ paddingBottom: '56.25%' }}>
            <iframe src={block.src} title="Embedded content" allowFullScreen loading="lazy" />
          </div>
        )
      }
      const src =
        block.provider === 'youtube'
          ? `https://www.youtube-nocookie.com/embed/${block.id}`
          : `https://player.vimeo.com/video/${block.id}`
      return (
        <div className="embed" style={{ paddingBottom: '56.25%' }}>
          <iframe
            src={src}
            title={block.provider === 'youtube' ? 'YouTube video' : 'Vimeo video'}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
          />
        </div>
      )
    }

    case 'video':
      return (
        <div className="embed-static">
          <video src={videoSrc(block.src)} controls playsInline preload="metadata" />
        </div>
      )

    case 'button':
      return (
        <div className="btn-wrap">
          <a className="btn" href={block.href} target="_blank" rel="noopener noreferrer">
            {block.label}
          </a>
        </div>
      )

    case 'form':
      return <ContactForm />

    case 'columns':
      return (
        <div className="columns">
          {block.columns.map((col, i) => (
            <div key={i}>
              {col.map((b, j) => (
                <BlockView key={j} block={b} onZoom={onZoom} />
              ))}
            </div>
          ))}
        </div>
      )

    default:
      return null
  }
}

/**
 * The original form posted to Adobe. Rather than ship something that silently fails,
 * this posts to VITE_CONTACT_ENDPOINT (Formspree, Basin, a Worker — anything that takes
 * a POST) and falls back to a plain mailto link when that isn't configured.
 */
function ContactForm() {
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  if (!CONTACT_ENDPOINT) {
    return (
      <p className="contact-fallback">
        Want to get in touch? Email me at{' '}
        <a href={`mailto:${EMAIL}`} style={{ color: 'var(--accent)' }}>
          {EMAIL}
        </a>
        .
      </p>
    )
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setState('sending')
    try {
      const res = await fetch(CONTACT_ENDPOINT!, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(e.currentTarget),
      })
      setState(res.ok ? 'sent' : 'error')
    } catch {
      setState('error')
    }
  }

  if (state === 'sent') return <p className="contact-fallback">Thanks — message sent. Rad!</p>

  return (
    <form className="contact" onSubmit={onSubmit}>
      <div className="field">
        <label htmlFor="cf-name">Name *</label>
        <input id="cf-name" name="name" placeholder="Your Name..." required />
      </div>
      <div className="field">
        <label htmlFor="cf-email">Email Address *</label>
        <input id="cf-email" name="email" type="email" placeholder="Your Email Address..." required />
      </div>
      <div className="field">
        <label htmlFor="cf-msg">Message *</label>
        <textarea id="cf-msg" name="message" placeholder="Your Message..." required />
      </div>
      <div className="actions">
        <button className="btn" type="submit" disabled={state === 'sending'}>
          {state === 'sending' ? 'Sending…' : 'Submit'}
        </button>
        {state === 'error' && (
          <p className="contact-fallback" style={{ marginTop: 12 }}>
            Something went wrong — email me at <a href={`mailto:${EMAIL}`}>{EMAIL}</a> instead.
          </p>
        )}
      </div>
    </form>
  )
}
