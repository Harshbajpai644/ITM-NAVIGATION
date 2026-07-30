import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import CampusMap from '../components/CampusMap'
import { buildingApi } from '../api/client'
import { CAMPUS, formatDistance, haversineDistance, walkingTimeMinutes } from '../utils/geo'
import { adminApi } from '../api/client'

export default function NavigatePage() {
  const [searchParams] = useSearchParams()
  const [buildings, setBuildings] = useState([])
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('')
  const [categories, setCategories] = useState([])
  const [selected, setSelected] = useState(null)
  const [userPosition, setUserPosition] = useState(null)
  const [geoError, setGeoError] = useState('')
  const [watching, setWatching] = useState(false)
  const [campus, setCampus] = useState(CAMPUS)

  useEffect(() => {
    buildingApi.active().then((res) => {
      const list = Array.isArray(res.data) ? res.data : res.data.results || []
      setBuildings(list)
    }).catch(() => setBuildings([]))

    buildingApi.categories().then((res) => setCategories(res.data)).catch(() => {})

    adminApi.campusInfo().then((res) => {
      setCampus({
        lat: res.data.latitude,
        lng: res.data.longitude,
        name: res.data.name,
      })
    }).catch(() => {})
  }, [])

  // Deep-link: /navigate?building=ID
  useEffect(() => {
    const id = searchParams.get('building')
    if (!id || buildings.length === 0) return
    const found = buildings.find((b) => String(b.id) === String(id))
    if (found) setSelected(found)
  }, [searchParams, buildings])

  const locate = useCallback(() => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by this browser.')
      return
    }
    setGeoError('')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserPosition({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        })
        setWatching(true)
      },
      (err) => {
        setGeoError(err.message || 'Unable to get location.')
        // Fallback near campus for demo / denied permission
        setUserPosition({
          lat: campus.lat + 0.0012,
          lng: campus.lng - 0.0008,
          accuracy: null,
          fallback: true,
        })
      },
      { enableHighAccuracy: true, timeout: 12000 },
    )
  }, [campus.lat, campus.lng])

  useEffect(() => {
    locate()
  }, [locate])

  useEffect(() => {
    if (!watching || !navigator.geolocation) return undefined
    const id = navigator.geolocation.watchPosition(
      (pos) => {
        setUserPosition({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        })
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 3000 },
    )
    return () => navigator.geolocation.clearWatch(id)
  }, [watching])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return buildings.filter((b) => {
      const matchCat = !category || b.category === category
      const matchQ =
        !q ||
        b.name.toLowerCase().includes(q) ||
        (b.description || '').toLowerCase().includes(q) ||
        (b.category || '').includes(q)
      return matchCat && matchQ
    })
  }, [buildings, query, category])

  const destination = selected
    ? {
        lat: Number(selected.latitude),
        lng: Number(selected.longitude),
        name: selected.name,
      }
    : null

  const routeMeta =
    userPosition && destination
      ? (() => {
          const meters = haversineDistance(
            userPosition.lat,
            userPosition.lng,
            destination.lat,
            destination.lng,
          )
          return {
            distance: formatDistance(meters),
            minutes: walkingTimeMinutes(meters),
          }
        })()
      : null

  return (
    <div className="map-page">
      <CampusMap
        campusCenter={campus}
        userPosition={userPosition}
        destination={destination}
        buildings={buildings}
        onSelectBuilding={setSelected}
      />

      <aside className="map-sidebar">
        <h2>Campus Navigation</h2>
        <p className="hint">Search a building, then follow the walking route on the map.</p>

        <div className="search-box">
          <input
            type="search"
            placeholder="Search destination…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search destination"
          />
        </div>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{
            width: '100%',
            marginBottom: '0.75rem',
            padding: '0.7rem 0.9rem',
            borderRadius: 12,
            border: '1px solid rgba(124,255,178,.2)',
            background: 'rgba(0,0,0,.3)',
            color: 'var(--text)',
          }}
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>

        {geoError && (
          <div className="alert alert-error" style={{ fontSize: '0.85rem' }}>
            {geoError} Using approximate campus position.
          </div>
        )}

        <ul className="building-list">
          {filtered.map((b) => (
            <li key={b.id}>
              <button
                type="button"
                className={selected?.id === b.id ? 'selected' : ''}
                onClick={() => setSelected(b)}
              >
                {b.name}
                <span className="meta">{b.category_display || b.category}</span>
              </button>
            </li>
          ))}
          {filtered.length === 0 && <li className="empty">No matches</li>}
        </ul>

        {selected && (
          <div className="route-card">
            <strong>{selected.name}</strong>
            <dl>
              <div>
                <dt>Distance</dt>
                <dd>{routeMeta ? routeMeta.distance : '—'}</dd>
              </div>
              <div>
                <dt>Walking time</dt>
                <dd>{routeMeta ? `~${routeMeta.minutes} min` : '—'}</dd>
              </div>
            </dl>
            {!userPosition && (
              <button type="button" className="btn btn-primary btn-sm" style={{ marginTop: '0.75rem' }} onClick={locate}>
                Enable GPS
              </button>
            )}
          </div>
        )}
      </aside>

      <div className="map-fab">
        <button type="button" title="My location" onClick={locate} aria-label="Go to my location">
          ◎
        </button>
      </div>
    </div>
  )
}