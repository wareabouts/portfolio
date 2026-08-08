import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import '@fontsource-variable/source-sans-3'
import './styles.css'
import App from './App'

const el = document.getElementById('root')!
const base = import.meta.env.BASE_URL

const tree = (
  <StrictMode>
    <BrowserRouter basename={base}>
      <App />
    </BrowserRouter>
  </StrictMode>
)

// Prerendered pages ship real markup, so hydrate rather than re-render from scratch.
// Test for element children specifically: the unrendered template still contains the
// `<!--app-html-->` comment, and hydrating against that fails.
if (el.childElementCount > 0) {
  hydrateRoot(el, tree, {
    onRecoverableError(error, info) {
      // Hydration mismatches are silently recovered by React, which makes them easy to
      // ship by accident. Keep them reachable for debugging.
      const store = ((window as unknown as Record<string, unknown>).__hydrationErrors ??= [])
      ;(store as unknown[]).push({ error, componentStack: info.componentStack })
      console.error('[hydration]', error, info.componentStack)
    },
  })
} else {
  createRoot(el).render(tree)
}
