import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Map, Euro, Lightbulb, Eye, CalendarDays, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { HeroSection } from '@/components/HeroSection';
import { DaySidebar } from '@/components/DaySidebar';
import { Timeline } from '@/components/Timeline';
import { ExpensesSection } from '@/components/ExpensesSection';
import { TipsSection } from '@/components/TipsSection';
import { SecretsGallery } from '@/components/SecretsGallery';
import { WeatherWidget } from '@/components/WeatherWidget';
import { TripForm } from '@/components/TripForm';
import { AppSidebar } from '@/components/AppSidebar';
import { MapTab } from '@/components/MapTab';
import { LoadingState } from '@/components/LoadingState';
import { InstallPrompt, OfflineIndicator } from '@/components/InstallPrompt';

import { generateItinerary } from '@/lib/gemini';
import { populateItineraryImages } from '@/lib/images';
import { getTripId } from '@/lib/db';
import { itineraryData as defaultItinerary } from '@/data/itinerary';
import type { TripData } from '@/data/itinerary';
import { useTripsStorage } from '@/hooks/useTripsStorage';

type ViewMode = 'timeline' | 'expenses' | 'tips' | 'secrets';

export default function App() {
  // ── Storage (IndexedDB via Dexie) ──────────────────────────────────────────
  const { trips, isLoading, saveTrip, deleteTrip } = useTripsStorage();

  // ── UI State ───────────────────────────────────────────────────────────────
  const [currentTripId, setCurrentTripId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [selectedDayId, setSelectedDayId] = useState<string>('');
  const [viewMode, setViewMode] = useState<ViewMode>('timeline');
  const [itineraryViewMode, setItineraryViewMode] = useState<'itinerary' | 'map'>('itinerary');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // ── Initialize UI once trips load from IndexedDB ───────────────────────────
  useEffect(() => {
    if (isLoading) return; // Esperar a que carguen los datos

    if (trips.length > 0) {
      // Si no hay selección activa, seleccionar el primero
      if (!currentTripId) {
        const firstId = getTripId(trips[0]);
        setCurrentTripId(firstId);
        setSelectedDayId(trips[0].days[0]?.id ?? '');
      }
    } else {
      // Primera vez: cargar el itinerario de ejemplo de París y guardarlo
      saveTrip(defaultItinerary).then(() => {
        const id = getTripId(defaultItinerary);
        setCurrentTripId(id);
        setSelectedDayId(defaultItinerary.days[0]?.id ?? '');
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  // ── Derived state ──────────────────────────────────────────────────────────
  const currentTrip = trips.find((t) => getTripId(t) === currentTripId) ?? trips[0];

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleSelectTrip = (id: string) => {
    const trip = trips.find((t) => getTripId(t) === id);
    if (trip) {
      setCurrentTripId(id);
      setSelectedDayId(trip.days[0]?.id ?? '');
      setShowForm(false);
      setSidebarOpen(false);
    }
  };

  const handleNewTrip = () => {
    setShowForm(true);
    setSidebarOpen(false);
  };

  const handleDeleteTrip = async (id: string) => {
    await deleteTrip(id);
    if (currentTripId === id) {
      const remaining = trips.filter((t) => getTripId(t) !== id);
      if (remaining.length > 0) {
        const nextId = getTripId(remaining[0]);
        setCurrentTripId(nextId);
        setSelectedDayId(remaining[0].days[0]?.id ?? '');
      } else {
        setShowForm(true);
        setCurrentTripId(null);
      }
    }
  };

  const handleFormSubmit = async (formData: Record<string, string>) => {
    setIsGenerating(true);
    try {
      let itinerary: TripData = await generateItinerary(formData);
      // Convertir imágenes a base64 para almacenamiento offline
      itinerary = await populateItineraryImages(itinerary);

      // Guardar en IndexedDB
      await saveTrip(itinerary);

      const newId = getTripId(itinerary);
      setCurrentTripId(newId);
      setSelectedDayId(itinerary.days[0]?.id ?? '');
      setShowForm(false);
      toast.success('¡Itinerario generado y guardado offline!', {
        description: 'Podrás verlo sin conexión a internet.',
      });
    } catch (error) {
      toast.error('Error al generar el itinerario', {
        description: (error as Error).message,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportTrip = (trip: TripData) => {
    try {
      const dataStr = JSON.stringify(trip, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      const exportFileDefaultName = `${trip.tripName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_itinerary.json`;

      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      toast.success('Itinerario exportado correctamente');
    } catch (error) {
      toast.error('Error al exportar el itinerario');
    }
  };

  const handleImportTrip = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const importedTrip = JSON.parse(content) as TripData;

        if (!importedTrip.tripName || !importedTrip.destination || !importedTrip.days) {
          throw new Error('El archivo no tiene un formato válido de itinerario.');
        }

        await saveTrip(importedTrip);
        const newId = getTripId(importedTrip);
        setCurrentTripId(newId);
        setSelectedDayId(importedTrip.days[0]?.id ?? '');
        setShowForm(false);
        setSidebarOpen(false);
        
        toast.success('Itinerario importado correctamente');
      } catch (error) {
        toast.error('Error al importar el itinerario', {
          description: (error as Error).message,
        });
      }
    };
    reader.readAsText(file);
    
    // Reset file input
    event.target.value = '';
  };

  const scrollToContent = useCallback(() => {
    contentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const handleSelectDay = (dayId: string) => {
    setSelectedDayId(dayId);
    setViewMode('timeline');
    setMobileMenuOpen(false);
  };

  const selectedDay = currentTrip?.days.find((d) => d.id === selectedDayId) ?? currentTrip?.days[0];

  const navItems: { mode: ViewMode; label: string; icon: React.ElementType }[] = [
    { mode: 'timeline', label: 'Itinerario', icon: CalendarDays },
    { mode: 'expenses', label: 'Gastos', icon: Euro },
    { mode: 'tips', label: 'Consejos', icon: Lightbulb },
    { mode: 'secrets', label: 'Secretos', icon: Eye },
  ];

  // ── Loading screen (IndexedDB inicializando) ───────────────────────────────
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-midnight">
        <div className="flex flex-col items-center gap-4 text-white/60">
          <Loader2 className="w-10 h-10 animate-spin text-gold" />
          <p className="font-serif text-lg text-white/80">Cargando tus viajes…</p>
          <p className="text-xs text-white/40">Recuperando datos guardados</p>
        </div>
      </div>
    );
  }

  // ── Main render ────────────────────────────────────────────────────────────
  return (
    <div className="flex min-h-screen bg-cream overflow-x-hidden">
      {/* PWA: Banner de instalación + indicador offline */}
      <OfflineIndicator />
      <InstallPrompt />

      {/* Sidebar */}
      <AppSidebar
        trips={trips}
        currentTripId={currentTripId}
        onSelectTrip={handleSelectTrip}
        onNewTrip={handleNewTrip}
        onImportTrip={handleImportTrip}
        onDeleteTrip={handleDeleteTrip}
        isOpen={sidebarOpen}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between p-4 bg-midnight text-white sticky top-0 z-40">
          <button onClick={() => setSidebarOpen(true)}>
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-serif font-medium">TravelAI</span>
          <div className="w-6" />
        </div>

        <main className="flex-1">
          {isGenerating ? (
            <LoadingState />
          ) : showForm ? (
            <div className="py-12 px-4">
              <TripForm onSubmit={handleFormSubmit} isLoading={isGenerating} />
            </div>
          ) : currentTrip ? (
            <>
              {/* Hero */}
              <HeroSection 
                trip={currentTrip} 
                onExplore={scrollToContent} 
                onExport={() => handleExportTrip(currentTrip)}
              />

              {/* Main content area */}
              <div ref={contentRef} className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8 md:py-12">
                {/* View mode navigation */}
                <div className="flex items-center justify-between mb-8">
                  <nav className="flex items-center gap-1 bg-white rounded-xl border border-stone p-1 shadow-soft overflow-x-auto scrollbar-hide">
                    {navItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = viewMode === item.mode;
                      return (
                        <button
                          key={item.mode}
                          onClick={() => setViewMode(item.mode)}
                          className={`
                            flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap
                            ${isActive ? 'bg-midnight text-white' : 'text-muted-foreground hover:text-midnight hover:bg-cream'}
                          `}
                        >
                          <Icon className="w-4 h-4" />
                          <span className="hidden sm:inline">{item.label}</span>
                        </button>
                      );
                    })}
                  </nav>

                  {/* Mobile day selector */}
                  <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="lg:hidden flex items-center gap-2 bg-midnight text-white px-4 py-2.5 rounded-xl text-sm font-medium"
                  >
                    <Map className="w-4 h-4" />
                    <span>Días</span>
                    {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                  </button>
                </div>

                {/* Mobile day menu */}
                <AnimatePresence>
                  {mobileMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="lg:hidden mb-6 overflow-hidden"
                    >
                      <DaySidebar
                        days={currentTrip.days}
                        selectedDayId={selectedDayId}
                        onSelectDay={handleSelectDay}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Content area */}
                <div className="flex flex-col lg:flex-row gap-8">
                  {/* Desktop sidebar */}
                  <div className="hidden lg:block w-72 shrink-0">
                    <DaySidebar
                      days={currentTrip.days}
                      selectedDayId={selectedDayId}
                      onSelectDay={handleSelectDay}
                    />
                  </div>

                  {/* Main content */}
                  <div className="flex-1 min-w-0">
                    <AnimatePresence mode="wait">
                      {viewMode === 'timeline' && selectedDay && (
                        <motion.div
                          key={`timeline-${selectedDayId}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="mb-6">
                            <WeatherWidget day={selectedDay} />
                          </div>

                          {/* Tab Selector */}
                          <div className="flex gap-2 p-1 bg-stone/30 rounded-xl mb-8 w-fit">
                            <button
                              onClick={() => setItineraryViewMode('itinerary')}
                              className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                                itineraryViewMode === 'itinerary'
                                  ? 'bg-white text-midnight shadow-soft'
                                  : 'text-midnight/50 hover:text-midnight'
                              }`}
                            >
                              Itinerario
                            </button>
                            <button
                              onClick={() => setItineraryViewMode('map')}
                              className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                                itineraryViewMode === 'map'
                                  ? 'bg-white text-midnight shadow-soft'
                                  : 'text-midnight/50 hover:text-midnight'
                              }`}
                            >
                              Mapa
                            </button>
                          </div>

                          <AnimatePresence mode="wait">
                            {itineraryViewMode === 'itinerary' ? (
                              <motion.div
                                key="itinerary"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                              >
                                <Timeline day={selectedDay} />
                              </motion.div>
                            ) : (
                              <motion.div
                                key="map"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                              >
                                <MapTab
                                  activities={selectedDay.activities}
                                  destination={currentTrip.destination}
                                />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      )}

                      {viewMode === 'expenses' && (
                        <motion.div
                          key="expenses"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.3 }}
                        >
                          <ExpensesSection days={currentTrip.days} />
                        </motion.div>
                      )}

                      {viewMode === 'tips' && (
                        <motion.div
                          key="tips"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.3 }}
                        >
                          <TipsSection tips={currentTrip.tips} />
                        </motion.div>
                      )}

                      {viewMode === 'secrets' && (
                        <motion.div
                          key="secrets"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.3 }}
                        >
                          <SecretsGallery secrets={currentTrip.secrets} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <footer className="bg-midnight text-white/60 py-8 mt-12">
                <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 text-center">
                  <p className="font-serif text-lg text-white/80 mb-2">{currentTrip.tripName}</p>
                  <p className="text-sm">Itinerario inteligente • {currentTrip.destination}</p>
                  <p className="text-xs mt-4 text-white/40">Potenciado por IA • Disponible offline</p>
                </div>
              </footer>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8">
              <button onClick={handleNewTrip} className="text-gold font-serif text-2xl hover:underline">
                Comienza tu primera aventura
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
