import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ActivityCard } from './ActivityCard';
import type { Day } from '@/data/itinerary';

interface TimelineProps {
  day: Day;
}

export function Timeline({ day }: TimelineProps) {
  const timelineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to top when day changes
    if (timelineRef.current) {
      timelineRef.current.scrollTop = 0;
    }
  }, [day.id]);

  const dayDate = new Date(day.date);
  const dayName = dayDate.toLocaleDateString('es-ES', { weekday: 'long' });
  const formattedDate = dayDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div ref={timelineRef} className="flex-1 min-w-0">
      {/* Day header */}
      <motion.div
        key={day.id + '-header'}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <span className="font-mono text-sm text-gold font-medium bg-gold/10 px-3 py-1 rounded-full">
            {dayName}
          </span>
          <span className="font-mono text-sm text-muted-foreground">
            {formattedDate}
          </span>
        </div>
        <h2 className="font-serif text-3xl md:text-4xl text-midnight font-medium">
          {day.label}
        </h2>
        <p className="text-muted-foreground mt-2">
          {day.activities.length} actividades planificadas
        </p>
      </motion.div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line - hidden on mobile, shown on lg */}
        <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-stone -translate-x-1/2" />
        
        {/* Mobile vertical line */}
        <div className="lg:hidden absolute left-5 top-0 bottom-0 w-0.5 bg-stone" />

        <div className="space-y-6 lg:space-y-8">
          {day.activities.map((activity, index) => (
            <ActivityCard key={activity.title + index} activity={activity} index={index} />
          ))}
        </div>
      </div>
    </div>
  );
}
