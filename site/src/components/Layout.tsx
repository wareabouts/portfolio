import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { imageSrc, taxonomy, assets } from '../content'

const LOGO = 'cd769df0-e25c-4a6b-925b-b12c24cf5246'

const SOCIAL = [
  { href: 'https://www.linkedin.com/in/alex-fiel/', label: 'LinkedIn', path: 'M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3zM9 9h3.8v1.7h.05c.53-.95 1.83-1.95 3.76-1.95 4.02 0 4.76 2.5 4.76 5.76V21h-4v-5.6c0-1.34-.03-3.06-1.9-3.06-1.9 0-2.2 1.45-2.2 2.96V21H9z' },
  { href: 'https://instagram.com/scealux', label: 'Instagram', path: 'M12 2.2c3.2 0 3.6 0 4.9.07 1.2.06 1.8.25 2.2.42.56.22.96.48 1.38.9.42.42.68.82.9 1.38.17.4.36 1 .42 2.2.06 1.3.07 1.7.07 4.9s0 3.6-.07 4.9c-.06 1.2-.25 1.8-.42 2.2-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.4.17-1 .36-2.2.42-1.3.06-1.7.07-4.9.07s-3.6 0-4.9-.07c-1.2-.06-1.8-.25-2.2-.42a3.8 3.8 0 0 1-1.38-.9 3.8 3.8 0 0 1-.9-1.38c-.17-.4-.36-1-.42-2.2C2.21 15.6 2.2 15.2 2.2 12s0-3.6.07-4.9c.06-1.2.25-1.8.42-2.2.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.4-.17 1-.36 2.2-.42C8.4 2.21 8.8 2.2 12 2.2zm0 3.4a6.4 6.4 0 1 0 0 12.8 6.4 6.4 0 0 0 0-12.8zm0 10.55a4.15 4.15 0 1 1 0-8.3 4.15 4.15 0 0 1 0 8.3zm6.65-10.8a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z' },
  { href: 'https://www.youtube.com/channel/UCkuLP58HsXOCfOPnZUCaWLQ', label: 'YouTube', path: 'M23 12s0-3.4-.43-5.03a2.6 2.6 0 0 0-1.84-1.85C19.1 4.7 12 4.7 12 4.7s-7.1 0-8.73.42a2.6 2.6 0 0 0-1.84 1.85C1 8.6 1 12 1 12s0 3.4.43 5.03a2.6 2.6 0 0 0 1.84 1.85c1.63.42 8.73.42 8.73.42s7.1 0 8.73-.42a2.6 2.6 0 0 0 1.84-1.85C23 15.4 23 12 23 12zM9.75 15.35v-6.7L15.5 12z' },
  { href: 'https://github.com/wareabouts', label: 'GitHub', path: 'M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48l-.01-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.5 9.5 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85l-.01 2.75c0 .27.18.58.69.48A10 10 0 0 0 12 2z' },
  { href: 'mailto:alex@alexfiel.com', label: 'Email', path: 'M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 4.24-8 4.76-8-4.76V6l8 4.75L20 6z' },
]

/**
 * Flips `data-theme` on <html> and remembers the choice.
 *
 * Deliberately stateless: the rendered markup is identical in both themes and CSS picks
 * the glyph off the root attribute. Reading the theme during render would make the
 * server and client disagree and break hydration.
 */
function ThemeToggle() {
  const toggle = () => {
    const root = document.documentElement
    const next = root.dataset.theme === 'light' ? 'dark' : 'light'
    root.dataset.theme = next
    document.querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', next === 'light' ? '#ffffff' : '#131316')
    try {
      localStorage.setItem('theme', next)
    } catch {
      /* private mode; the toggle still works for this page view */
    }
  }

  return (
    <button className="theme-toggle" onClick={toggle} aria-label="Toggle light and dark mode">
      <svg className="icon-sun" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 17a5 5 0 1 1 0-10 5 5 0 0 1 0 10zm0-13a1 1 0 0 1-1-1V1a1 1 0 1 1 2 0v2a1 1 0 0 1-1 1zm0 16a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0v-2a1 1 0 0 1 1-1zM4 12a1 1 0 0 1-1 1H1a1 1 0 1 1 0-2h2a1 1 0 0 1 1 1zm19 0a1 1 0 0 1-1 1h-2a1 1 0 1 1 0-2h2a1 1 0 0 1 1 1zM5.6 5.6a1 1 0 0 1 0-1.4l1.4-1.4a1 1 0 1 1 1.4 1.4L7 5.6a1 1 0 0 1-1.4 0zm11.4 11.4a1 1 0 0 1 1.4 0l1.4 1.4a1 1 0 0 1-1.4 1.4L17 18.4a1 1 0 0 1 0-1.4zm1.4-12.8a1 1 0 0 1 1.4 1.4L18.4 7A1 1 0 0 1 17 5.6zM5.6 18.4a1 1 0 0 1 1.4-1.4l1.4 1.4a1 1 0 1 1-1.4 1.4z" />
      </svg>
      <svg className="icon-moon" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
      </svg>
    </button>
  )
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()

  // Close the mobile menu and return to the top whenever the route changes.
  useEffect(() => {
    setOpen(false)
    window.scrollTo(0, 0)
  }, [pathname])

  const logo = assets[LOGO] ? imageSrc(LOGO, '150px') : null

  return (
    <div className="shell">
      <header className="sidebar">
        <Link to="/" className="logo" aria-label="Alex Fiel — home">
          {logo ? (
            <img src={logo.src} srcSet={logo.srcSet} sizes="150px" alt="Alex Fiel" width={651} height={321} />
          ) : (
            <strong>Alex Fiel</strong>
          )}
        </Link>

        <button
          className="menu-btn"
          aria-expanded={open}
          aria-controls="site-nav"
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>

        <nav className="nav" id="site-nav" data-open={open}>
          {taxonomy.nav.map((n) => (
            <NavLink key={n.slug} to={n.slug === 'all-the-things' ? '/' : `/${n.slug}`} end>
              {n.label}
            </NavLink>
          ))}
        </nav>

        <div className="social">
          {SOCIAL.map((s) => (
            <a key={s.label} href={s.href} aria-label={s.label} target="_blank" rel="noopener noreferrer me">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d={s.path} />
              </svg>
            </a>
          ))}
          <ThemeToggle />
        </div>
      </header>

      <main className="main">
        {children}
        <button className="to-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          ↑ Back to Top
        </button>
        <footer className="footer">Made by Alex Fiel — © {new Date().getFullYear()}</footer>
      </main>
    </div>
  )
}
