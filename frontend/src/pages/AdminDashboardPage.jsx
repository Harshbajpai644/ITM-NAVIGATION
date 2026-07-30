import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { adminApi, visitorApi } from '../api/client'
import { formatDateTime } from '../utils/geo'

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 })
  const [visitors, setVisitors] = useState([])
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [dash, list] = await Promise.all([
        adminApi.dashboard(),
        visitorApi.list({
          search: search || undefined,
          status: status || undefined,
          page_size: 100,
        }),
      ])
      setStats(dash.data.stats)
      const rows = Array.isArray(list.data) ? list.data : list.data.results || []
      setVisitors(rows)
    } catch {
      setError('Failed to load dashboard data.')
    } finally {
      setLoading(false)
    }
  }, [search, status])

  useEffect(() => {
    const t = setTimeout(load, 180)
    return () => clearTimeout(t)
  }, [load])

  async function approve(id) {
    setBusyId(id)
    try {
      await visitorApi.approve(id)
      await load()
    } catch {
      setError('Approve failed.')
    } finally {
      setBusyId(null)
    }
  }

  async function reject(id) {
    setBusyId(id)
    try {
      await visitorApi.reject(id)
      await load()
    } catch {
      setError('Reject failed.')
    } finally {
      setBusyId(null)
    }
  }

  async function remove(id) {
    if (!window.confirm('Delete this visitor pass?')) return
    setBusyId(id)
    try {
      await visitorApi.remove(id)
      await load()
    } catch {
      setError('Delete failed.')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', alignItems: 'end' }}>
        <div>
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="page-sub">Review visitor passes — search, filter, approve, reject, or delete.</p>
        </div>
        <Link className="btn btn-ghost" to="/admin/buildings">
          Manage Buildings
        </Link>
      </div>

      <div className="stats-row">
        <div className="stat">
          <strong>{stats.total}</strong>
          <span>Total</span>
        </div>
        <div className="stat">
          <strong>{stats.pending}</strong>
          <span>Pending</span>
        </div>
        <div className="stat">
          <strong>{stats.approved}</strong>
          <span>Approved</span>
        </div>
        <div className="stat">
          <strong>{stats.rejected}</strong>
          <span>Rejected</span>
        </div>
      </div>

      <div className="glass-panel">
        <div className="toolbar">
          <input
            type="search"
            placeholder="Search name, email, mobile, destination…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {loading ? (
          <p className="empty">Loading visitors…</p>
        ) : visitors.length === 0 ? (
          <p className="empty">No visitor passes found.</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Visitor</th>
                  <th>Department</th>
                  <th>Destination</th>
                  <th>Visit</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {visitors.map((v) => (
                  <tr key={v.id}>
                    <td>
                      <strong>{v.full_name}</strong>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        {v.mobile}
                        <br />
                        {v.email}
                      </div>
                    </td>
                    <td>{v.department}</td>
                    <td>
                      {v.destination}
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{v.purpose}</div>
                    </td>
                    <td>{formatDateTime(v.visit_time)}</td>
                    <td>
                      <span className={`badge badge-${v.status}`}>{v.status}</span>
                    </td>
                    <td>
                      <div className="actions">
                        {v.status !== 'approved' && (
                          <button className="btn btn-primary btn-sm" disabled={busyId === v.id} onClick={() => approve(v.id)}>
                            Approve
                          </button>
                        )}
                        {v.status !== 'rejected' && (
                          <button className="btn btn-ghost btn-sm" disabled={busyId === v.id} onClick={() => reject(v.id)}>
                            Reject
                          </button>
                        )}
                        <button className="btn btn-danger btn-sm" disabled={busyId === v.id} onClick={() => remove(v.id)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}