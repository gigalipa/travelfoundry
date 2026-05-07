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
 * Busca imágenes representativas para el destino y las actividades,
 * y las convierte a base64 para almacenamiento offline completo.
 */
export async function populateItineraryImages(itinerary: TripData): Promise<TripData> {
  const updatedItinerary = { ...itinerary };

  // Imagen principal del viaje (Hero)
  const destinationKeyword = encodeURIComponent(itinerary.destination.split(',')[0].trim());
  let heroUrl = `https://loremflickr.com/1200/800/${destinationKeyword},landscape`;

  if (itinerary.destination.toLowerCase().includes('paris')) {
    heroUrl = `https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=1200&auto=format&fit=crop`;
  }

  updatedItinerary.heroImage = await fetchImageAsBase64(heroUrl);

  // Imágenes para actividades (en paralelo para velocidad)
  const activityPromises: Promise<void>[] = [];
  for (const day of updatedItinerary.days) {
    for (const activity of day.activities) {
      const keyword = encodeURIComponent(
        activity.title.split(' ')[0] + ',' + activity.location.split(' ')[0]
      );
      const actUrl = `https://loremflickr.com/800/600/${keyword},travel`;
      activityPromises.push(
        fetchImageAsBase64(actUrl).then((b64) => {
          activity.image = b64;
        })
      );
    }
  }

  // Imágenes para secretos (en paralelo)
  const secretPromises: Promise<void>[] = [];
  if (updatedItinerary.secrets) {
    for (const secret of updatedItinerary.secrets) {
      const keyword = encodeURIComponent(secret.name.split(' ')[0]);
      const secUrl = `https://loremflickr.com/800/600/${keyword},secret,architecture`;
      secretPromises.push(
        fetchImageAsBase64(secUrl).then((b64) => {
          secret.image = b64;
        })
      );
    }
  }

  await Promise.all([...activityPromises, ...secretPromises]);

  return updatedItinerary;
}

// Extendemos la interfaz TripData para incluir heroImage opcional si no existe
declare module '../data/itinerary' {
  interface TripData {
    heroImage?: string;
  }
}
