import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
// React Router 7 exports StaticRouter from the package root; the old
// `react-router-dom/server` subpath no longer exists.
import { StaticRouter } from 'react-router'
import App from './App'

/** Rendered by scripts/prerender.mjs to bake each route into static HTML. */
export function render(url: string, base: string): string {
  return renderToString(
    <StrictMode>
      <StaticRouter location={url} basename={base}>
        <App />
      </StaticRouter>
    </StrictMode>,
  )
}
