import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/navigate', label: 'Navigate' },
  { to: '/buildings', label: 'Buildings' },
  { to: '/visitor-pass', label: 'Visitor Pass' },
]

export default function Layout() {
  const { isAuthenticated, user, logout } = useAuth()
  const location = useLocation()
  const isMapPage = location.pathname.startsWith('/navigate')

  return (
    <div className={`app-shell ${isMapPage ? 'map-mode' : ''}`}>
      <header className="glass-nav">
        <NavLink to="/" className="brand">
          <span className="brand-mark" aria-hidden="true" />
          <span className="brand-text">
            <strong>ITM</strong>
            <em>Campus Navigator</em>
          </span>
        </NavLink>

        <nav className="nav-links" aria-label="Primary">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className={({ isActive }) => (isActive ? 'active' : '')}>
              {link.label}
            </NavLink>
          ))}
          {isAuthenticated ? (
            <>
              <NavLink to="/admin" className={({ isActive }) => (isActive ? 'active' : '')}>
                Dashboard
              </NavLink>
              <button type="button" className="nav-btn" onClick={logout} title={user?.username}>
                Logout
              </button>
            </>
          ) : (
            <NavLink to="/admin/login" className="nav-cta">
              Admin
            </NavLink>
          )}
        </nav>
      </header>

      <main className={isMapPage ? 'map-main' : 'page-main'}>
        <Outlet />
      </main>

      {!isMapPage && (
        <footer className="site-footer">
          <p>ITM Campus Navigator · OpenStreetMap · Secure Visitor Access</p>
        </footer>
      )}
    </div>
  )
}