// Map service for handling OpenStreetMap with Leaflet integration
const mapService = {
  // Helper function to extract coordinates from Google Maps URL
  extractCoordinatesFromUrl: (mapUrl) => {
    if (!mapUrl) return null

    const patterns = [
      /@(-?\d+\.?\d*),(-?\d+\.?\d*)/, // @lat,lng format
      /q=(-?\d+\.?\d*),(-?\d+\.?\d*)/, // q=lat,lng format
      /ll=(-?\d+\.?\d*),(-?\d+\.?\d*)/, // ll=lat,lng format
      /!3d(-?\d+\.?\d*)!4d(-?\d+\.?\d*)/, // 3d/4d format
    ]

    for (const pattern of patterns) {
      const match = mapUrl.match(pattern)
      if (match) {
        return {
          lat: Number.parseFloat(match[1]),
          lng: Number.parseFloat(match[2]),
        }
      }
    }

    return null
  },

  // Geocode address to coordinates using Nominatim (OpenStreetMap's geocoding service)
  geocodeAddress: async (address) => {
    try {
      // Replace with your preferred geocoding service
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
      )
      const data = await response.json()

      if (data && data[0]) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
        }
      }
      throw new Error("Location not found")
    } catch (error) {
      console.error("Geocoding error:", error)
      throw new Error("Unable to geocode address")
    }
  },

  // Get coordinates from either URL or address
  getCoordinates: async (mapUrl, address) => {
    // First try to extract from URL
    if (mapUrl) {
      const coords = mapService.extractCoordinatesFromUrl(mapUrl)
      if (coords) return coords
    }

    // Fallback to geocoding the address
    if (address) {
      return await mapService.geocodeAddress(address)
    }

    return null
  },

  // Validate coordinates
  isValidCoordinates: (coords) => {
    return (
      coords &&
      typeof coords.lat === "number" &&
      typeof coords.lng === "number" &&
      coords.lat >= -90 &&
      coords.lat <= 90 &&
      coords.lng >= -180 &&
      coords.lng <= 180
    )
  },
}

export { mapService }
