import type { TripData } from '../data/itinerary';

type GenerateItineraryResponse = {
  itinerary?: TripData;
  error?: string;
};

export async function generateItinerary(formData: unknown): Promise<TripData> {
  const response = await fetch('/api/generate-itinerary', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ formData }),
  });

  const data = (await response.json().catch(() => ({}))) as GenerateItineraryResponse;

  if (!response.ok || !data.itinerary) {
    throw new Error(data.error || 'Error al generar el itinerario.');
  }

  return data.itinerary;
}
