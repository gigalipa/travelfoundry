export async function getRoute(points: { lat: number, lng: number }[]): Promise<[number, number][]> {
  if (points.length < 2) return [];

  const coordinates = points.map(p => `${p.lng},${p.lat}`).join(';');
  try {
    const response = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=full&geometries=geojson`
    );
    const data = await response.json();
    
    if (data.routes && data.routes.length > 0) {
      // OSRM devuelve [lng, lat], Leaflet usa [lat, lng]
      return data.routes[0].geometry.coordinates.map((c: [number, number]) => [c[1], c[0]]);
    }
  } catch (error) {
    console.error('Error fetching OSRM route:', error);
  }
  
  // Fallback: línea recta si falla la API
  return points.map(p => [p.lat, p.lng]);
}
