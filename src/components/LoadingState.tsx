import { motion } from 'framer-motion';
import { Sparkles, Plane } from 'lucide-react';

export function LoadingState() {
  const steps = [
    "Analizando tus preferencias...",
    "Consultando guías locales...",
    "Calculando las mejores rutas...",
    "Buscando rincones secretos...",
    "Preparando tu itinerario perfecto..."
  ];

  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="relative mb-12">
        {/* Animated background circles */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 -m-20 bg-gold rounded-full blur-[100px]"
        />
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.15, 0.1] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute inset-0 -m-20 bg-garden rounded-full blur-[100px]"
        />

        {/* Main Spinner Icon */}
        <div className="relative z-10 w-32 h-32 bg-white rounded-full shadow-elevated flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 border-4 border-dashed border-gold/30 rounded-full"
          />
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <Plane className="w-12 h-12 text-midnight" />
          </motion.div>
          
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute -top-4 -right-4 w-12 h-12 bg-garden text-white rounded-xl shadow-soft flex items-center justify-center"
          >
            <Sparkles className="w-6 h-6" />
          </motion.div>
        </div>
      </div>

      <h3 className="font-serif text-3xl text-midnight mb-6">Tu aventura está cobrando vida</h3>
      
      <div className="max-w-md w-full bg-white/50 backdrop-blur-sm border border-stone rounded-2xl p-6 shadow-soft">
        <div className="space-y-4">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 1.5, duration: 0.5 }}
              className="flex items-center gap-3 text-midnight/60 text-sm font-medium"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-gold" />
              {step}
            </motion.div>
          ))}
        </div>
        
        {/* Progress bar */}
        <div className="mt-8 h-1.5 w-full bg-stone rounded-full overflow-hidden">
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 8, ease: "easeInOut" }}
            className="h-full bg-gold"
          />
        </div>
      </div>

      <p className="mt-8 text-muted-foreground text-sm font-mono uppercase tracking-widest animate-pulse">
        Utilizando IA avanzada para máxima precisión
      </p>
    </div>
  );
}
