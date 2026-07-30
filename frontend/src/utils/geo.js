/**
 * Haversine distance (meters) and walking-time estimate.
 */
const EARTH_RADIUS_M = 6371000
const WALKING_SPEED_MPS = 1.4 // ~5 km/h

function toRad(deg) {
  return (deg * Math.PI) / 180
}

export function haversineDistance(lat1, lng1, lat2, lng2) {
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(a))
}

export function formatDistance(meters) {
  if (meters < 1000) return `${Math.round(meters)} m`
  return `${(meters / 1000).toFixed(2)} km`
}

export function walkingTimeMinutes(meters) {
  return Math.max(1, Math.round(meters / WALKING_SPEED_MPS / 60))
}

export function formatDateTime(iso) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  } catch {
    return iso
  }
}

export const CAMPUS = {
  lat: Number(import.meta.env.VITE_CAMPUS_LAT || 26.1408),
  lng: Number(import.meta.env.VITE_CAMPUS_LNG || 78.1991),
  name: import.meta.env.VITE_CAMPUS_NAME || 'ITM Campus',
}