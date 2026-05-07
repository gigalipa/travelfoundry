import { motion } from 'framer-motion';
import { MapPin, Calendar, ChevronDown, Download } from 'lucide-react';
import type { TripData } from '@/data/itinerary';

interface HeroSectionProps {
  onExplore: () => void;
  onExport: () => void;
  trip: TripData;
}

export function HeroSection({ onExplore, onExport, trip }: HeroSectionProps) {
  const startDate = new Date(trip.startDate);
  const endDate = new Date(trip.endDate);
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <section className="relative w-full h-[70vh] min-h-[500px] overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000"
        style={{ backgroundImage: `url(${trip.heroImage || '/images/hero-paris.jpg'})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-midnight/60 via-midnight/40 to-midnight/80" />

      {/* Export Button */}
      <div className="absolute top-6 right-6 z-20">
        <button
          onClick={onExport}
          className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl backdrop-blur-md transition-all border border-white/20 shadow-soft"
          title="Exportar Itinerario"
        >
          <Download className="w-4 h-4" />
          <span className="text-sm font-medium hidden sm:inline">Exportar</span>
        </button>
      </div>

      <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          className="max-w-3xl"
        >
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="font-mono text-gold text-sm tracking-widest uppercase mb-4"
          >
            Itinerario de viaje
          </motion.p>

          <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl text-white font-medium leading-tight mb-6">
            {trip.tripName.split(':')[0]}
            {trip.tripName.includes(':') && (
              <>
                <br />
                <span className="italic text-gold">{trip.tripName.split(':')[1]}</span>
              </>
            )}
          </h1>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="flex flex-wrap items-center justify-center gap-4 md:gap-6 text-white/80 text-sm md:text-base"
          >
            <span className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gold" />
              {trip.destination}
            </span>
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gold" />
              {formatDate(startDate)} — {formatDate(endDate)}
            </span>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            className="font-mono text-white/60 text-sm mt-4"
          >
            {diffDays + 1} días de descubrimiento
          </motion.p>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          onClick={onExplore}
          className="absolute bottom-12 flex flex-col items-center gap-2 text-white/70 hover:text-gold transition-colors cursor-pointer group"
        >
          <span className="text-sm font-medium tracking-wide uppercase">Explorar itinerario</span>
          <ChevronDown className="w-5 h-5 animate-bounce group-hover:text-gold" />
        </motion.button>
      </div>
    </section>
  );
}
