import { Link, Navigate, useParams } from 'react-router-dom'
import Blocks from './components/Blocks'
import CoverGrid from './components/CoverGrid'
import {
  categoryLabel,
  categoryProjects,
  pageBySlug,
  projectBySlug,
  projects,
  taxonomy,
} from './content'
import { useDocumentMeta } from './meta'

const SITE = 'Alex Fiel - Creative Technologist'

export function Home() {
  useDocumentMeta(SITE, 'Projects by Alex Fiel, a Creative Technologist based in Seattle.')
  return <CoverGrid items={projects} />
}

export function Category() {
  const { slug = '' } = useParams()
  const label = categoryLabel(slug)
  const items = categoryProjects(slug)
  useDocumentMeta(`${SITE} - ${label ?? slug}`, `${label ?? slug} projects by Alex Fiel.`)

  if (!taxonomy.categories[slug]) return <Navigate to="/404" replace />
  return (
    <>
      <h1 className="project-title" style={{ fontSize: 34, marginBottom: 24 }}>
        {label ?? slug}
      </h1>
      {items.length ? <CoverGrid items={items} /> : <p>Nothing here yet.</p>}
    </>
  )
}

export function Page() {
  const { slug = '' } = useParams()
  const doc = pageBySlug.get(slug)
  useDocumentMeta(doc ? `${SITE} - ${doc.title}` : SITE)
  if (!doc) return <Navigate to="/404" replace />
  return (
    <>
      <h1 className="project-title" style={{ fontSize: 34, marginBottom: 28 }}>
        {doc.title}
      </h1>
      <Blocks blocks={doc.blocks} />
    </>
  )
}

export function Project() {
  const { slug = '' } = useParams()
  const doc = projectBySlug.get(slug)
  useDocumentMeta(doc ? `${SITE} - ${doc.title}` : SITE)
  if (!doc) return <Navigate to="/404" replace />

  return (
    <article>
      <h1 className="project-title">{doc.title}</h1>
      <div className="project-meta">
        {doc.year && <span>{doc.year}</span>}
        {doc.categories?.map((c) => (
          <Link key={c} to={`/${c}`}>
            {categoryLabel(c) ?? c}
          </Link>
        ))}
      </div>
      <Blocks blocks={doc.blocks} />
    </article>
  )
}

export function NotFound() {
  useDocumentMeta(`${SITE} - Not found`)
  return (
    <div style={{ textAlign: 'center', padding: '60px 0' }}>
      <h1 className="project-title" style={{ fontSize: 34 }}>
        Page not found
      </h1>
      <p style={{ color: 'var(--muted)' }}>
        That page doesn't exist. <Link to="/" style={{ color: 'var(--accent)' }}>Back to all the things →</Link>
      </p>
    </div>
  )
}
