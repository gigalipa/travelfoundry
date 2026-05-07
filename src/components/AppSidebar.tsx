import { useRef } from 'react';
import { Plus, History, Map as MapIcon, ChevronRight, Trash2, Upload } from 'lucide-react';
import type { TripData } from '@/data/itinerary';
import { getTripId } from '@/lib/db';
import { OnlineStatusBadge } from '@/components/InstallPrompt';

interface AppSidebarProps {
  trips: TripData[];
  currentTripId: string | null;
  onSelectTrip: (tripId: string) => void;
  onNewTrip: () => void;
  onImportTrip: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDeleteTrip: (tripId: string) => void;
  isOpen: boolean;
}

export function AppSidebar({ trips, currentTripId, onSelectTrip, onNewTrip, onImportTrip, onDeleteTrip, isOpen }: AppSidebarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  return (
    <div 
      className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-midnight text-white transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:relative lg:translate-x-0 border-r border-white/10
      `}
    >
      <div className="h-full flex flex-col p-6">
        {/* Logo/Title */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl bg-gold flex items-center justify-center shadow-soft">
            <MapIcon className="w-6 h-6 text-midnight" />
          </div>
          <h1 className="font-serif text-xl font-medium tracking-wide">TravelAI</h1>
        </div>

        {/* Action Button */}
        <button
          onClick={onNewTrip}
          className="flex items-center justify-center gap-2 w-full bg-gold hover:bg-gold/90 text-midnight font-medium py-3.5 rounded-xl transition-all mb-8 shadow-soft group"
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
          Nuevo viaje
        </button>

        {/* History List */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
          <div className="flex items-center gap-2 text-white/40 text-xs font-mono uppercase tracking-widest mb-4 ml-1">
            <History className="w-3 h-3" />
            Tus Itinerarios
          </div>

          {trips.length === 0 ? (
            <div className="text-white/20 text-sm text-center py-8 italic border border-dashed border-white/10 rounded-xl">
              Aún no has creado viajes
            </div>
          ) : (
            trips.map((trip, index) => {
              const tripId = getTripId(trip);
              const isActive = currentTripId === tripId;
              return (
                <div key={index} className="group relative">
                  <button
                    onClick={() => onSelectTrip(tripId)}
                    className={`
                      w-full text-left p-4 rounded-xl transition-all flex items-center justify-between
                      ${isActive ? 'bg-white/10 border border-white/20' : 'hover:bg-white/5 border border-transparent'}
                    `}
                  >
                    <div className="min-w-0">
                      <h3 className="text-sm font-medium truncate mb-1">{trip.tripName}</h3>
                      <p className="text-xs text-white/40 truncate">{trip.destination}</p>
                    </div>
                    <ChevronRight className={`w-4 h-4 transition-transform ${isActive ? 'text-gold opacity-100' : 'opacity-0 group-hover:opacity-100 group-hover:translate-x-1'}`} />
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteTrip(tripId);
                    }}
                    className="absolute -right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 hover:text-red-400 p-2 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="pt-6 mt-6 border-t border-white/10 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-white/30 text-xs">TravelAI</span>
            <OnlineStatusBadge />
          </div>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-2 w-full bg-white/5 hover:bg-white/10 text-white/80 font-medium py-3 rounded-xl transition-all border border-white/10"
            title="Importar un itinerario desde un archivo JSON"
          >
            <Upload className="w-4 h-4" />
            <span className="text-sm">Importar viaje</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={onImportTrip}
            accept=".json"
            className="hidden"
          />
        </div>
      </div>
    </div>
  );
}
