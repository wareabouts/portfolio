import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { faArrowUp, faEnvelope, faMoon, faSun } from '@fortawesome/free-solid-svg-icons'
import { faGithub, faInstagram, faLinkedin, faYoutube } from '@fortawesome/free-brands-svg-icons'
import { imageSrc, taxonomy, assets } from '../content'
import { navIcon } from '../icons'
import Icon from './Icon'

const LOGO = 'cd769df0-e25c-4a6b-925b-b12c24cf5246'

const SOCIAL = [
  { href: 'https://www.linkedin.com/in/alex-fiel/', label: 'LinkedIn', icon: faLinkedin },
  { href: 'https://instagram.com/scealux', label: 'Instagram', icon: faInstagram },
  { href: 'https://www.youtube.com/channel/UCkuLP58HsXOCfOPnZUCaWLQ', label: 'YouTube', icon: faYoutube },
  { href: 'https://github.com/wareabouts', label: 'GitHub', icon: faGithub },
  { href: 'mailto:alex@alexfiel.com', label: 'Email', icon: faEnvelope },
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
      <Icon icon={faSun} className="icon-sun" />
      <Icon icon={faMoon} className="icon-moon" />
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
        <Link to="/" className="logo" aria-label="Alex Fiel, home">
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
              <Icon icon={navIcon(n.slug)} />
              <span>{n.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="social">
          {SOCIAL.map((s) => (
            <a key={s.label} href={s.href} aria-label={s.label} target="_blank" rel="noopener noreferrer me">
              <Icon icon={s.icon} />
            </a>
          ))}
          <ThemeToggle />
        </div>
      </header>

      <main className="main">
        {children}
        <button className="to-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <Icon icon={faArrowUp} />
          <span>Back to top</span>
        </button>
        <footer className="footer">Made by Alex Fiel · © {new Date().getFullYear()}</footer>
      </main>
    </div>
  )
}
