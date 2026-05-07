import { motion } from 'framer-motion';
import { Sun, Cloud, CloudRain, CloudSun, Thermometer } from 'lucide-react';
import type { Day } from '@/data/itinerary';

interface WeatherWidgetProps {
  day: Day;
}

const weatherConfig = {
  sunny: { icon: Sun, label: 'Soleado', color: 'text-amber-500', bg: 'bg-amber-50' },
  'partly-cloudy': { icon: CloudSun, label: 'Parcialmente nublado', color: 'text-blue-500', bg: 'bg-blue-50' },
  cloudy: { icon: Cloud, label: 'Nublado', color: 'text-slate-500', bg: 'bg-slate-50' },
  rainy: { icon: CloudRain, label: 'Lluvioso', color: 'text-blue-600', bg: 'bg-blue-50' },
};

export function WeatherWidget({ day }: WeatherWidgetProps) {
  const config = weatherConfig[day.weather.condition];
  const WeatherIcon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-stone p-5 shadow-soft"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 rounded-full ${config.bg} flex items-center justify-center`}>
          <WeatherIcon className={`w-5 h-5 ${config.color}`} />
        </div>
        <div>
          <h3 className="font-medium text-midnight text-sm">Pronóstico del día</h3>
          <p className="text-xs text-muted-foreground">{config.label}</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Thermometer className="w-4 h-4 text-terracotta" />
          <span className="font-mono text-2xl font-medium text-midnight">{day.weather.temp}°C</span>
        </div>
        <div className="h-8 w-px bg-stone" />
        <div className="text-sm text-muted-foreground">
          <p>Clima en destino</p>
          <p className="text-xs">Ideal para tus planes</p>
        </div>
      </div>
    </motion.div>
  );
}
