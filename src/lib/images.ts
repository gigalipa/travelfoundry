import type { TripData } from '../data/itinerary';

/**
 * Descarga una imagen desde una URL y la convierte a Data URL (base64).
 * Si falla (sin conexión, CORS, etc.), retorna la URL original como fallback.
 */
async function fetchImageAsBase64(url: string): Promise<string> {
  try {
    const response = await fetch(url, { mode: 'cors' });
    if (!response.ok) return url;
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(url); // fallback a URL
      reader.readAsDataURL(blob);
    });
  } catch {
    // Sin conexión o CORS — retornar URL como fallback
    return url;
  }
}

/**
 * Busca en Pexels una imagen que coincida con la consulta a través de nuestro proxy seguro.
 */
async function getPexelsImageUrl(
  query: string,
  orientation: 'landscape' | 'square' | 'portrait' = 'landscape',
  size: 'large' | 'medium' = 'medium'
): Promise<string | null> {
  try {
    const url = `/api/search-images?query=${encodeURIComponent(query)}&orientation=${orientation}&size=${size}`;
    const response = await fetch(url);

    if (!response.ok) return null;

    const data = await response.json();
    return data.url || null;
  } catch (err) {
    console.error('Proxy search failed for query:', query, err);
  }

  return null;
}

/**
 * Busca imágenes representativas para el destino y las actividades,
 * y las convierte a base64 para almacenamiento offline completo.
 */
export async function populateItineraryImages(itinerary: TripData): Promise<TripData> {
  const updatedItinerary = { ...itinerary };

  // 1. Imagen principal del viaje (Hero)
  const destinationKeyword = itinerary.destination.split(',')[0].trim();
  let heroUrl = await getPexelsImageUrl(`${destinationKeyword} landmark`, 'landscape', 'large');

  // Fallback genérico a la ciudad si la búsqueda muy específica falla
  if (!heroUrl) {
    heroUrl = await getPexelsImageUrl(destinationKeyword, 'landscape', 'large');
  }

  // Fallback absoluto si no hay llave de API o falla todo
  if (!heroUrl) {
    heroUrl = `https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=1200&auto=format&fit=crop`;
  }

  updatedItinerary.heroImage = await fetchImageAsBase64(heroUrl);

  // 2. Imágenes para actividades (en paralelo para velocidad)
  const activityPromises: Promise<void>[] = [];
  for (const day of updatedItinerary.days) {
    for (const activity of day.activities) {
      // Intentamos con título corto + destino para ser más precisos (ej. "Museo del Louvre Paris")
      const titleClean = activity.title.split('-')[0].split('(')[0].trim();
      const query = `${titleClean} ${destinationKeyword}`.trim();
      
      activityPromises.push(
        getPexelsImageUrl(query, 'landscape', 'medium').then(async (url) => {
          let finalUrl = url;
          // Si no encuentra, busca solo por la categoría en el destino
          if (!finalUrl) {
            finalUrl = await getPexelsImageUrl(`${activity.category} ${destinationKeyword}`, 'landscape', 'medium');
          }
          // Si sigue sin encontrar, imagen por defecto
          if (!finalUrl) {
            finalUrl = `https://images.unsplash.com/photo-1488085061387-422e29b40080?q=80&w=800&auto=format&fit=crop`;
          }
          activity.image = await fetchImageAsBase64(finalUrl);
        })
      );
    }
  }

  // 3. Imágenes para secretos (en paralelo)
  const secretPromises: Promise<void>[] = [];
  if (updatedItinerary.secrets) {
    for (const secret of updatedItinerary.secrets) {
      const nameClean = secret.name.split('-')[0].split('(')[0].trim();
      const query = `${nameClean} ${destinationKeyword}`.trim();
      
      secretPromises.push(
        getPexelsImageUrl(query, 'landscape', 'medium').then(async (url) => {
          let finalUrl = url;
          if (!finalUrl) {
            finalUrl = await getPexelsImageUrl(`${destinationKeyword} secret gem`, 'landscape', 'medium');
          }
          if (!finalUrl) {
            finalUrl = `https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=800&auto=format&fit=crop`;
          }
          secret.image = await fetchImageAsBase64(finalUrl);
        })
      );
    }
  }

  // Esperar a que se descarguen/conviertan todas las imágenes
  await Promise.all([...activityPromises, ...secretPromises]);

  return updatedItinerary;
}

// Extendemos la interfaz TripData para incluir heroImage opcional si no existe
declare module '../data/itinerary' {
  interface TripData {
    heroImage?: string;
  }
}
