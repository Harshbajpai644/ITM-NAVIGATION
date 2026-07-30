import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function AdminLoginPage() {
  const { login, isAuthenticated, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  if (isAuthenticated) {
    return <Navigate to={location.state?.from?.pathname || '/admin'} replace />
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      await login(username, password)
      navigate('/admin', { replace: true })
    } catch (err) {
      const detail = err.response?.data
      const msg =
        detail?.non_field_errors?.[0] ||
        detail?.detail ||
        (typeof detail === 'object' ? Object.values(detail).flat()[0] : null) ||
        'Login failed. Check credentials.'
      setError(msg)
    }
  }

  return (
    <div className="login-wrap glass-panel">
      <h1 className="page-title">Admin Login</h1>
      <p className="page-sub">Staff access for visitor approvals and building management.</p>
      {error && <div className="alert alert-error">{error}</div>}
      <form onSubmit={onSubmit} className="form-grid" style={{ gridTemplateColumns: '1fr' }}>
        <div className="field">
          <label htmlFor="username">Username</label>
          <input id="username" value={username} onChange={(e) => setUsername(e.target.value)} required autoComplete="username" />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  )
}