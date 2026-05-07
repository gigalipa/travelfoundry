export interface GeoPoint {
  lat: number;
  lng: number;
  title: string;
}

const geoCache = new Map<string, GeoPoint>();

export async function geocodeLocation(location: string, title: string, context?: string): Promise<GeoPoint | null> {
  const cacheKey = `${location}-${title}-${context}`;
  if (geoCache.has(cacheKey)) return geoCache.get(cacheKey)!;

  try {
    // Añadimos el contexto (ej: la ciudad) para filtrar resultados incorrectos
    const searchQuery = context ? `${location}, ${context}` : location;
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`
    );
    const data = await response.json();
    if (data && data.length > 0) {
      const point = {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
        title
      };
      geoCache.set(cacheKey, point);
      return point;
    }
  } catch (error) {
    console.error('Geocoding error:', error);
  }
  return null;
}
