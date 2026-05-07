import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Wallet, Calendar, Sparkles, Send, PlaneTakeoff, PlaneLanding, Briefcase, Heart } from 'lucide-react';
import { LocationAutocomplete } from './LocationAutocomplete';

interface TripFormProps {
  onSubmit: (data: Record<string, string>) => void;
  isLoading: boolean;
}

export function TripForm({ onSubmit, isLoading }: TripFormProps) {
  const [formData, setFormData] = useState({
    origin: '',
    destination: '',
    conditions: '',
    tripType: 'Turismo',
    travelers: '1 persona',
    budget: 'medio',
    arrival: '',
    departure: '',
    interests: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const inputClasses = "w-full bg-white/50 border border-stone focus:border-gold focus:ring-1 focus:ring-gold rounded-xl px-4 py-3 outline-none transition-all text-midnight placeholder:text-muted-foreground/60";
  const labelClasses = "block text-sm font-medium text-midnight/70 mb-2 ml-1";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-4xl mx-auto bg-white rounded-3xl shadow-dramatic border border-stone overflow-hidden"
    >
      <div className="bg-midnight p-8 text-white text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-gold rounded-full blur-[100px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-garden rounded-full blur-[100px]" />
        </div>
        
        <h2 className="font-serif text-3xl md:text-4xl mb-3 relative z-10">Diseña tu próximo viaje</h2>
        <p className="text-white/60 font-sans relative z-10">Cuéntale a nuestro especialista en IA tus planes y creará el itinerario perfecto para ti.</p>
      </div>

      <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Origen y Destino */}
          <div className="space-y-4">
            <div>
              <label className={labelClasses}>
                <span className="flex items-center gap-2">
                  Origen
                </span>
              </label>
              <LocationAutocomplete
                required
                placeholder="Ciudad de salida"
                className={inputClasses}
                value={formData.origin}
                onChange={(val) => setFormData({ ...formData, origin: val })}
                icon={<PlaneTakeoff className="w-4 h-4 text-gold" />}
              />
            </div>
            <div>
              <label className={labelClasses}>
                <span className="flex items-center gap-2">
                  Destino
                </span>
              </label>
              <LocationAutocomplete
                required
                placeholder="¿A dónde quieres ir?"
                className={inputClasses}
                value={formData.destination}
                onChange={(val) => setFormData({ ...formData, destination: val })}
                icon={<PlaneLanding className="w-4 h-4 text-gold" />}
              />
            </div>
          </div>

          {/* Fechas */}
          <div className="space-y-4">
            <div>
              <label className={labelClasses}>
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gold" /> Llegada al destino
                </span>
              </label>
              <input
                required
                type="datetime-local"
                className={inputClasses}
                value={formData.arrival}
                onChange={(e) => setFormData({ ...formData, arrival: e.target.value })}
              />
            </div>
            <div>
              <label className={labelClasses}>
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gold" /> Regreso al origen
                </span>
              </label>
              <input
                required
                type="datetime-local"
                className={inputClasses}
                value={formData.departure}
                onChange={(e) => setFormData({ ...formData, departure: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Tipo de Viaje */}
          <div>
            <label className={labelClasses}>
              <span className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-gold" /> Tipo de viaje
              </span>
            </label>
            <select
              className={inputClasses}
              value={formData.tripType}
              onChange={(e) => setFormData({ ...formData, tripType: e.target.value })}
            >
              <option>Turismo</option>
              <option>Familiar</option>
              <option>Negocios</option>
              <option>Romántico</option>
              <option>Aventura</option>
            </select>
          </div>

          {/* Viajeros */}
          <div>
            <label className={labelClasses}>
              <span className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gold" /> Viajeros
              </span>
            </label>
            <input
              type="text"
              placeholder="Ej: 2 adultos, 1 niño (5 años)"
              className={inputClasses}
              value={formData.travelers}
              onChange={(e) => setFormData({ ...formData, travelers: e.target.value })}
            />
          </div>

          {/* Presupuesto */}
          <div>
            <label className={labelClasses}>
              <span className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-gold" /> Presupuesto
              </span>
            </label>
            <select
              className={inputClasses}
              value={formData.budget}
              onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
            >
              <option value="bajo">Bajo (Económico)</option>
              <option value="medio-bajo">Medio-Bajo</option>
              <option value="medio">Medio</option>
              <option value="medio-alto">Medio-Alto</option>
              <option value="alto">Alto (Premium)</option>
              <option value="ilimitado">Ilimitado (Lujo)</option>
            </select>
          </div>
        </div>

        {/* Condiciones y Detalles */}
        <div className="space-y-6">
          <div>
            <label className={labelClasses}>
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-gold" /> Condiciones y estilo de viaje
              </span>
            </label>
            <textarea
              placeholder="Ej: Pienso viajar con equipaje ligero, prefiero caminar que usar transporte público..."
              className={`${inputClasses} h-24 resize-none`}
              value={formData.conditions}
              onChange={(e) => setFormData({ ...formData, conditions: e.target.value })}
            />
          </div>

          <div>
            <label className={labelClasses}>
              <span className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-gold" /> Lugares o intereses específicos
              </span>
            </label>
            <textarea
              placeholder="Ej: Quiero visitar el Museo del Louvre, me encanta la comida callejera, sitios de Harry Potter..."
              className={`${inputClasses} h-24 resize-none`}
              value={formData.interests}
              onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
            />
          </div>
        </div>

        <div className="flex justify-center pt-4">
          <button
            disabled={isLoading}
            type="submit"
            className={`
              flex items-center gap-3 px-10 py-4 rounded-2xl font-medium text-lg transition-all
              ${isLoading 
                ? 'bg-stone text-muted-foreground cursor-not-allowed' 
                : 'bg-midnight text-white hover:bg-gold hover:shadow-elevated transform hover:-translate-y-1'
              }
            `}
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Generando itinerario...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Crear mi viaje inolvidable
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
