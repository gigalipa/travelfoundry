import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, X, Eye } from 'lucide-react';
import type { TripData } from '@/data/itinerary';

interface SecretsGalleryProps {
  secrets: TripData['secrets'];
}

export function SecretsGallery({ secrets }: SecretsGalleryProps) {
  const [selectedSecret, setSelectedSecret] = useState<TripData['secrets'][0] | null>(null);

  return (
    <section className="bg-white rounded-xl border border-stone p-6 md:p-8 shadow-soft">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-terracotta/10 flex items-center justify-center">
          <Eye className="w-5 h-5 text-terracotta" />
        </div>
        <div>
          <h2 className="font-serif text-2xl text-midnight">Secretos del itinerario</h2>
          <p className="text-sm text-muted-foreground">Lugares especiales y poco turísticos que descubrirás</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {secrets.map((secret, index) => (
          <motion.div
            key={secret.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => setSelectedSecret(secret)}
            className="group relative rounded-xl overflow-hidden cursor-pointer aspect-[4/3]"
          >
            <img
              src={secret.image}
              alt={secret.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-midnight/80 via-midnight/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
            
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <h3 className="font-serif text-lg text-white font-medium mb-1">{secret.name}</h3>
              <div className="flex items-center gap-1.5 text-white/70 text-sm">
                <MapPin className="w-3.5 h-3.5" />
                <span>{secret.location}</span>
              </div>
            </div>

            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="bg-white/20 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
                Ver más
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selectedSecret && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-midnight/60 backdrop-blur-sm"
            onClick={() => setSelectedSecret(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl overflow-hidden max-w-lg w-full shadow-dramatic"
            >
              <div className="relative h-48">
                <img
                  src={selectedSecret.image}
                  alt={selectedSecret.name}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => setSelectedSecret(null)}
                  className="absolute top-3 right-3 w-8 h-8 bg-midnight/60 hover:bg-midnight text-white rounded-full flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-6">
                <h3 className="font-serif text-2xl text-midnight mb-2">{selectedSecret.name}</h3>
                <div className="flex items-center gap-1.5 text-muted-foreground text-sm mb-4">
                  <MapPin className="w-4 h-4 text-gold" />
                  <span>{selectedSecret.location}</span>
                </div>
                <p className="text-foreground/80 leading-relaxed">{selectedSecret.description}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
