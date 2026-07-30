import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { buildingApi } from '../api/client'

const emptyForm = {
  name: '',
  category: 'academic',
  description: '',
  latitude: '',
  longitude: '',
  floor_count: 1,
  is_active: true,
}

export default function AdminBuildingsPage() {
  const [buildings, setBuildings] = useState([])
  const [categories, setCategories] = useState([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const { data } = await buildingApi.list({
        search: search || undefined,
        category: category || undefined,
        page_size: 200,
      })
      setBuildings(Array.isArray(data) ? data : data.results || [])
    } catch {
      setError('Failed to load buildings.')
    } finally {
      setLoading(false)
    }
  }, [search, category])

  useEffect(() => {
    buildingApi.categories().then((res) => setCategories(res.data)).catch(() => {})
  }, [])

  useEffect(() => {
    const t = setTimeout(load, 180)
    return () => clearTimeout(t)
  }, [load])

  function openCreate() {
    setEditing(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  function openEdit(b) {
    setEditing(b)
    setForm({
      name: b.name,
      category: b.category,
      description: b.description || '',
      latitude: String(b.latitude),
      longitude: String(b.longitude),
      floor_count: b.floor_count,
      is_active: b.is_active,
    })
    setModalOpen(true)
  }

  function onChange(e) {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  async function onSave(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    const payload = {
      ...form,
      latitude: Number(form.latitude),
      longitude: Number(form.longitude),
      floor_count: Number(form.floor_count) || 1,
    }
    try {
      if (editing) {
        await buildingApi.update(editing.id, payload)
      } else {
        await buildingApi.create(payload)
      }
      setModalOpen(false)
      await load()
    } catch (err) {
      const detail = err.response?.data
      setError(
        (typeof detail === 'object' && Object.values(detail).flat()[0]) ||
          'Save failed.',
      )
    } finally {
      setSaving(false)
    }
  }

  async function onDelete(id) {
    if (!window.confirm('Delete this building?')) return
    try {
      await buildingApi.remove(id)
      await load()
    } catch {
      setError('Delete failed.')
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', alignItems: 'end' }}>
        <div>
          <h1 className="page-title">Buildings CRUD</h1>
          <p className="page-sub">Create, update, and organize campus landmarks.</p>
        </div>
        <div className="cta-row">
          <Link className="btn btn-ghost" to="/admin">
            Visitors
          </Link>
          <button type="button" className="btn btn-primary" onClick={openCreate}>
            Add Building
          </button>
        </div>
      </div>

      <div className="glass-panel">
        <div className="toolbar">
          <input type="search" placeholder="Search buildings…" value={search} onChange={(e) => setSearch(e.target.value)} />
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
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
          <p className="empty">Loading…</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Coordinates</th>
                  <th>Floors</th>
                  <th>Active</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {buildings.map((b) => (
                  <tr key={b.id}>
                    <td>
                      <strong>{b.name}</strong>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{b.description}</div>
                    </td>
                    <td>{b.category_display || b.category}</td>
                    <td>
                      {Number(b.latitude).toFixed(5)}, {Number(b.longitude).toFixed(5)}
                    </td>
                    <td>{b.floor_count}</td>
                    <td>{b.is_active ? 'Yes' : 'No'}</td>
                    <td>
                      <div className="actions">
                        <button className="btn btn-ghost btn-sm" type="button" onClick={() => openEdit(b)}>
                          Edit
                        </button>
                        <button className="btn btn-danger btn-sm" type="button" onClick={() => onDelete(b.id)}>
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

      {modalOpen && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal glass-panel">
            <h2 className="page-title" style={{ fontSize: '1.4rem' }}>
              {editing ? 'Edit Building' : 'New Building'}
            </h2>
            <form onSubmit={onSave} className="form-grid">
              <div className="field">
                <label htmlFor="name">Name</label>
                <input id="name" name="name" value={form.name} onChange={onChange} required />
              </div>
              <div className="field">
                <label htmlFor="category">Category</label>
                <select id="category" name="category" value={form.category} onChange={onChange} required>
                  {categories.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="latitude">Latitude</label>
                <input id="latitude" name="latitude" type="number" step="any" value={form.latitude} onChange={onChange} required />
              </div>
              <div className="field">
                <label htmlFor="longitude">Longitude</label>
                <input id="longitude" name="longitude" type="number" step="any" value={form.longitude} onChange={onChange} required />
              </div>
              <div className="field">
                <label htmlFor="floor_count">Floors</label>
                <input id="floor_count" name="floor_count" type="number" min="1" value={form.floor_count} onChange={onChange} />
              </div>
              <div className="field" style={{ justifyContent: 'end' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
                  <input type="checkbox" name="is_active" checked={form.is_active} onChange={onChange} />
                  Active
                </label>
              </div>
              <div className="field full">
                <label htmlFor="description">Description</label>
                <textarea id="description" name="description" value={form.description} onChange={onChange} />
              </div>
              <div className="field full cta-row">
                <button type="button" className="btn btn-ghost" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving…' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}