import { motion } from 'framer-motion';
import { Check, Circle, Sun, Cloud, CloudRain, CloudSun } from 'lucide-react';
import type { Day } from '@/data/itinerary';

interface DaySidebarProps {
  days: Day[];
  selectedDayId: string;
  onSelectDay: (dayId: string) => void;
}

const weatherIcons = {
  sunny: Sun,
  'partly-cloudy': CloudSun,
  cloudy: Cloud,
  rainy: CloudRain,
};

export function DaySidebar({ days, selectedDayId, onSelectDay }: DaySidebarProps) {
  return (
    <aside className="w-full lg:w-[280px] shrink-0">
      <div className="lg:sticky lg:top-6">
        <h2 className="font-serif text-xl text-midnight mb-4 px-1">Días del viaje</h2>
        <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible scrollbar-hide pb-2 lg:pb-0">
          {days.map((day, index) => {
            const isActive = day.id === selectedDayId;
            const isPast = day.dayNumber < 0; // Simple logic, can be enhanced with real dates
            const WeatherIcon = weatherIcons[day.weather.condition];

            return (
              <motion.button
                key={day.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.08, duration: 0.4 }}
                onClick={() => onSelectDay(day.id)}
                className={`
                  relative flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200
                  min-w-[200px] lg:min-w-0 cursor-pointer border-2
                  ${isActive
                    ? 'bg-midnight text-white border-gold shadow-elevated'
                    : 'bg-white text-midnight border-transparent hover:border-gold/30 hover:shadow-soft'
                  }
                `}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gold rounded-r-full"
                  />
                )}

                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center shrink-0
                  ${isActive ? 'bg-gold/20 text-gold' : 'bg-cream text-midnight/60'}
                `}>
                  {isPast ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Circle className="w-4 h-4" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">
                    {day.dayNumber === 0 ? 'Llegada' : `Día ${day.dayNumber}`}
                  </p>
                  <p className={`text-xs ${isActive ? 'text-white/60' : 'text-muted-foreground'}`}>
                    {new Date(day.date).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}
                  </p>
                </div>

                <div className={`flex items-center gap-1 text-xs ${isActive ? 'text-white/60' : 'text-muted-foreground'}`}>
                  <WeatherIcon className="w-3.5 h-3.5" />
                  <span className="font-mono">{day.weather.temp}°</span>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
