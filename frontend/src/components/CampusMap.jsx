import { useEffect, useMemo, useState } from 'react'
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import { formatDistance, haversineDistance, walkingTimeMinutes } from '../utils/geo'

// Fix default Leaflet marker paths under Vite
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})

const userIcon = L.divIcon({
  className: '',
  html: `<div style="width:18px;height:18px;border-radius:50%;background:#4da3ff;border:3px solid white;box-shadow:0 0 0 6px rgba(77,163,255,.28)"></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
})

const destIcon = L.divIcon({
  className: '',
  html: `<div style="width:22px;height:22px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:#7cffb2;border:2px solid #0b3d2e;box-shadow:0 6px 14px rgba(0,0,0,.35)"></div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 22],
})

function Recenter({ center, zoom }) {
  const map = useMap()
  useEffect(() => {
    if (center) map.setView(center, zoom ?? map.getZoom(), { animate: true })
  }, [center, zoom, map])
  return null
}

function FitBounds({ points }) {
  const map = useMap()
  useEffect(() => {
    if (!points || points.length < 2) return
    map.fitBounds(L.latLngBounds(points), { padding: [60, 60], maxZoom: 17 })
  }, [points, map])
  return null
}

export default function CampusMap({
  campusCenter,
  userPosition,
  destination,
  buildings = [],
  onSelectBuilding,
}) {
  const routePoints = useMemo(() => {
    if (!userPosition || !destination) return null
    return [
      [userPosition.lat, userPosition.lng],
      [destination.lat, destination.lng],
    ]
  }, [userPosition, destination])

  const routeMeta = useMemo(() => {
    if (!userPosition || !destination) return null
    const meters = haversineDistance(
      userPosition.lat,
      userPosition.lng,
      destination.lat,
      destination.lng,
    )
    return {
      distance: formatDistance(meters),
      minutes: walkingTimeMinutes(meters),
      meters,
    }
  }, [userPosition, destination])

  const [tileReady, setTileReady] = useState(true)

  return (
    <div className="map-canvas">
      <MapContainer
        center={[campusCenter.lat, campusCenter.lng]}
        zoom={16}
        zoomControl={false}
        attributionControl
        style={{ width: '100%', height: '100%' }}
        whenReady={() => setTileReady(true)}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Recenter
          center={
            destination
              ? [destination.lat, destination.lng]
              : userPosition
                ? [userPosition.lat, userPosition.lng]
                : [campusCenter.lat, campusCenter.lng]
          }
          zoom={destination || userPosition ? 17 : 16}
        />

        {routePoints && <FitBounds points={routePoints} />}

        {buildings.map((b) => (
          <Marker
            key={b.id}
            position={[Number(b.latitude), Number(b.longitude)]}
            eventHandlers={{
              click: () => onSelectBuilding?.(b),
            }}
          >
            <Popup>
              <strong>{b.name}</strong>
              <br />
              {b.category_display || b.category}
            </Popup>
          </Marker>
        ))}

        {userPosition && (
          <Marker position={[userPosition.lat, userPosition.lng]} icon={userIcon}>
            <Popup>Your current location</Popup>
          </Marker>
        )}

        {destination && (
          <Marker position={[destination.lat, destination.lng]} icon={destIcon}>
            <Popup>
              <strong>{destination.name}</strong>
              {routeMeta && (
                <>
                  <br />
                  {routeMeta.distance} · ~{routeMeta.minutes} min walk
                </>
              )}
            </Popup>
          </Marker>
        )}

        {routePoints && (
          <Polyline
            positions={routePoints}
            pathOptions={{
              color: '#7cffb2',
              weight: 5,
              opacity: 0.9,
              dashArray: '10 8',
            }}
          />
        )}
      </MapContainer>
      {!tileReady && <div className="empty">Loading map…</div>}
    </div>
  )
}

export { formatDistance, walkingTimeMinutes, haversineDistance }