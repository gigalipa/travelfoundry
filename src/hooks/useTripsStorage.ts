import { useState, useEffect, useCallback } from 'react';
import type { TripData } from '../data/itinerary';
import {
  loadAllTrips,
  saveTrip as dbSaveTrip,
  deleteTrip as dbDeleteTrip,
  getTripId,
  migrateFromLocalStorage,
} from '../lib/db';

interface UseTripsStorageReturn {
  trips: TripData[];
  isLoading: boolean;
  saveTrip: (trip: TripData) => Promise<void>;
  deleteTrip: (id: string) => Promise<void>;
  getTripIdHelper: (trip: TripData) => string;
}

/**
 * Hook que gestiona el almacenamiento de viajes en IndexedDB (Dexie).
 * Maneja la carga inicial, migración desde localStorage, y operaciones CRUD.
 */
export function useTripsStorage(): UseTripsStorageReturn {
  const [trips, setTrips] = useState<TripData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Carga inicial: migrar + cargar desde IndexedDB
  useEffect(() => {
    async function init() {
      try {
        // 1. Migrar datos de localStorage si existen (solo ocurre una vez)
        await migrateFromLocalStorage();

        // 2. Cargar todos los viajes de IndexedDB
        const loaded = await loadAllTrips();
        setTrips(loaded);
      } catch (err) {
        console.error('[TravelAI] Error al cargar viajes:', err);
      } finally {
        setIsLoading(false);
      }
    }
    init();
  }, []);

  const saveTrip = useCallback(async (trip: TripData) => {
    await dbSaveTrip(trip);
    // Recargar la lista completa para mantener orden correcto
    const updated = await loadAllTrips();
    setTrips(updated);
  }, []);

  const deleteTrip = useCallback(async (id: string) => {
    await dbDeleteTrip(id);
    setTrips((prev) => prev.filter((t) => getTripId(t) !== id));
  }, []);

  return {
    trips,
    isLoading,
    saveTrip,
    deleteTrip,
    getTripIdHelper: getTripId,
  };
}
