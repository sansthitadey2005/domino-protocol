import React, { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import './Navbar.css'

const NAV_LINKS = [
  { to: '/',         label: 'Home',      icon: '⬡' },
  { to: '/map',      label: 'Map',       icon: '◎' },
  { to: '/analysis', label: 'Analysis',  icon: '⊕' },
  { to: '/results',  label: 'Results',   icon: '▣' },
  { to: '/alerts',   label: 'Alerts',    icon: '⚑' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close menu on route change
  useEffect(() => setMenuOpen(false), [location])

  return (
    <nav className={`navbar${scrolled ? ' navbar--scrolled' : ''}`}>
      <div className="navbar__inner container">
        <NavLink to="/" className="navbar__brand">
          <span className="navbar__logo">◈</span>
          <span className="navbar__title">Domino<span className="navbar__accent"> Protocol</span></span>
        </NavLink>

        <ul className={`navbar__links${menuOpen ? ' navbar__links--open' : ''}`}>
          {NAV_LINKS.map(({ to, label, icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={to === '/'}
                className={({ isActive }) => `navbar__link${isActive ? ' navbar__link--active' : ''}`}
              >
                <span className="navbar__link-icon">{icon}</span>
                {label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="navbar__right hide-mobile">
          <span className="navbar__status">
            <span className="status-dot status-dot--live" />
            Live Data
          </span>
        </div>

        <button
          className="navbar__hamburger"
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          <span /><span /><span />
        </button>
      </div>
    </nav>
  )
}
