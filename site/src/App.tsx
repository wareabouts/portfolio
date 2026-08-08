import { Navigate, Route, Routes, useParams } from 'react-router-dom'
import Layout from './components/Layout'
import { Category, Home, NotFound, Page, Project } from './pages'
import { pageBySlug, projectBySlug, taxonomy } from './content'

/**
 * One slug namespace, same as the original site: /some-project, /3d-design and /about all
 * sit at the root. A single dynamic route dispatches on what the slug actually is.
 */
function Slug() {
  const { slug = '' } = useParams()

  const redirect = taxonomy.redirects?.[`/${slug}`]
  if (redirect) return <Navigate to={redirect} replace />
  if (taxonomy.categories[slug]) return <Category />
  if (projectBySlug.has(slug)) return <Project />
  if (pageBySlug.has(slug)) return <Page />
  return <NotFound />
}

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/all-the-things" element={<Navigate to="/" replace />} />
        <Route path="/404" element={<NotFound />} />
        <Route path="/:slug" element={<Slug />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  )
}
