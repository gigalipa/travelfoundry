import Dexie, { type Table } from 'dexie';
import type { TripData } from '../data/itinerary';

/**
 * Registro de un viaje en IndexedDB.
 * Guardamos el objeto TripData completo (con imágenes en base64) bajo `data`.
 */
export interface TripRecord {
  id: string;          // Clave primaria: startDate + destination
  tripName: string;    // Para búsquedas y listado rápido
  destination: string;
  startDate: string;
  createdAt: number;   // timestamp para ordenar por más reciente
  data: TripData;      // El objeto completo con imágenes en base64
}

class TravelDB extends Dexie {
  trips!: Table<TripRecord, string>;

  constructor() {
    super('TravelAI_DB');
    this.version(1).stores({
      trips: 'id, tripName, destination, startDate, createdAt',
    });
  }
}

export const db = new TravelDB();

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Genera el ID único de un viaje */
export function getTripId(trip: TripData): string {
  return `${trip.startDate}__${trip.destination}`;
}

/** Guarda o actualiza un viaje en IndexedDB */
export async function saveTrip(trip: TripData): Promise<void> {
  const record: TripRecord = {
    id: getTripId(trip),
    tripName: trip.tripName,
    destination: trip.destination,
    startDate: trip.startDate,
    createdAt: Date.now(),
    data: trip,
  };
  await db.trips.put(record);
}

/** Carga todos los viajes ordenados por más reciente */
export async function loadAllTrips(): Promise<TripData[]> {
  const records = await db.trips.orderBy('createdAt').reverse().toArray();
  return records.map((r) => r.data);
}

/** Elimina un viaje por ID */
export async function deleteTrip(id: string): Promise<void> {
  await db.trips.delete(id);
}

/** Cuenta cuántos viajes hay almacenados */
export async function countTrips(): Promise<number> {
  return db.trips.count();
}

/**
 * Migra viajes existentes de localStorage a IndexedDB.
 * Se ejecuta una sola vez al iniciar si hay datos en localStorage.
 */
export async function migrateFromLocalStorage(): Promise<void> {
  const LS_KEY = 'travel_ai_trips';
  const raw = localStorage.getItem(LS_KEY);
  if (!raw) return;

  try {
    const trips: TripData[] = JSON.parse(raw);
    if (!Array.isArray(trips) || trips.length === 0) return;

    for (const trip of trips) {
      const existing = await db.trips.get(getTripId(trip));
      if (!existing) {
        await saveTrip(trip);
      }
    }

    // Limpiar localStorage tras migración exitosa
    localStorage.removeItem(LS_KEY);
    console.log(`[TravelAI] Migrados ${trips.length} viaje(s) de localStorage a IndexedDB.`);
  } catch (e) {
    console.warn('[TravelAI] No se pudo migrar desde localStorage:', e);
  }
}
