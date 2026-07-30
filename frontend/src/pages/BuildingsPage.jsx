import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { buildingApi } from '../api/client'

export default function BuildingsPage() {
  const [buildings, setBuildings] = useState([])
  const [categories, setCategories] = useState([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    buildingApi.categories().then((res) => setCategories(res.data)).catch(() => {})
  }, [])

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError('')
      try {
        const { data } = await buildingApi.list({
          search: search || undefined,
          category: category || undefined,
          active: true,
        })
        if (!cancelled) {
          setBuildings(Array.isArray(data) ? data : data.results || [])
        }
      } catch {
        if (!cancelled) setError('Could not load buildings.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    const t = setTimeout(load, 200)
    return () => {
      cancelled = true
      clearTimeout(t)
    }
  }, [search, category])

  return (
    <div>
      <h1 className="page-title">Campus Buildings</h1>
      <p className="page-sub">Browse landmarks by category, then open navigation.</p>

      <div className="toolbar">
        <input
          type="search"
          placeholder="Search buildings…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search buildings"
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Filter by category">
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {loading ? (
        <p className="empty">Loading buildings…</p>
      ) : buildings.length === 0 ? (
        <p className="empty">No buildings match your filters.</p>
      ) : (
        <div className="building-cards">
          {buildings.map((b) => (
            <article key={b.id} className="building-card">
              <span className="badge badge-approved">{b.category_display || b.category}</span>
              <h3>{b.name}</h3>
              <p>{b.description || 'Campus landmark'}</p>
              <Link className="btn btn-primary btn-sm" to={`/navigate?building=${b.id}`}>
                Navigate
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}