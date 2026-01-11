
import { useState, useEffect, useRef } from "react"
import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from "react-leaflet"
import { mapService } from "../../services/api"
import L from 'leaflet'
import "../../styles/leaflet-map.css"

const VenueMap = ({
  mapLocationUrl,
  venueName,
  location,
  height = "350px",
  zoom = 15,
}) => {
  const [coordinates, setCoordinates] = useState(null)
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const mapRef = useRef(null)

  // Custom marker icon
  const customIcon = new L.Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  useEffect(() => {
    const getCoordinates = async () => {
      try {
        setIsLoading(true)
        let coords = null

        // First try to extract coordinates from Google Maps URL if available
        if (mapLocationUrl) {
          coords = mapService.extractCoordinatesFromUrl(mapLocationUrl)
        }

        // If no coordinates from URL, try geocoding the location string
        if (!coords && location) {
          coords = await mapService.geocodeAddress(location)
        }

        // If both methods fail, use fallback coordinates (e.g., city center)
        if (!coords) {
          coords = {
            lat: 27.7172,
            lng: 85.3240 // Kathmandu coordinates as fallback
          }
          console.warn("Using fallback coordinates for:", venueName)
        }

        setCoordinates(coords)
        setError(null)
      } catch (err) {
        console.error("Map error:", err)
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    getCoordinates()
  }, [mapLocationUrl, location, venueName])

  const handleMapLoad = () => {
    setIsLoading(false)
  }

  if (error) {
    return (
      <div
        style={{
          height,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f8f9fa",
          border: "1px solid #dee2e6",
          borderRadius: "4px",
        }}
      >
        <p style={{ color: "#dc3545" }}>{error}</p>
      </div>
    )
  }

  if (!coordinates) {
    return (
      <div
        style={{
          height,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f8f9fa",
          border: "1px solid #dee2e6",
          borderRadius: "4px",
        }}
      >
        <div className="venue-map-spinner"></div>
      </div>
    )
  }

  return (
    <div className="venue-map-container" style={{ height }}>
      <MapContainer
        center={[coordinates.lat, coordinates.lng]}
        zoom={zoom}
        style={{ height: "100%", width: "100%" }}
        ref={mapRef}
        zoomControl={false}
        whenReady={handleMapLoad}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          maxZoom={19}
          minZoom={5}
          keepBuffer={8} // Increase tile buffer for smoother loading
          updateWhenIdle={true} // Only update tiles when user stops moving
          updateWhenZooming={false} // Don't update tiles while zooming
        />
        <ZoomControl position="bottomright" />
        <Marker position={[coordinates.lat, coordinates.lng]} icon={customIcon}>
          <Popup>
            <strong>{venueName}</strong>
            <br />
            {location}
          </Popup>
        </Marker>
      </MapContainer>
      {isLoading && (
        <div className="venue-map-loading">
          <div className="venue-map-spinner"></div>
        </div>
      )}
    </div>
  )
}

export default VenueMap
