import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Landmark, Utensils, Train, Camera, TreePine, Coffee,
  MapPin, Clock, Lightbulb, Sparkles, ChevronRight, X
} from 'lucide-react';
import type { Activity } from '@/data/itinerary';
import { categoryColors, categoryLabels } from '@/data/itinerary';

const iconMap: Record<string, React.ElementType> = {
  landmark: Landmark,
  utensils: Utensils,
  train: Train,
  camera: Camera,
  'tree-pine': TreePine,
  coffee: Coffee,
};

interface ActivityCardProps {
  activity: Activity;
  index: number;
}

export function ActivityCard({ activity, index }: ActivityCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const colors = categoryColors[activity.category] || categoryColors.sightseeing;
  const Icon = iconMap[colors.icon] || Camera;
  const CategoryIcon = iconMap[colors.icon] || Camera;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="relative"
    >
      {/* Timeline node */}
      <div className="absolute left-0 lg:left-1/2 lg:-translate-x-1/2 top-6 w-10 h-10 rounded-full bg-gold border-4 border-cream shadow-soft z-10 flex items-center justify-center">
        <Icon className="w-4 h-4 text-white" />
      </div>

      {/* Card */}
      <div className={`
        ml-14 lg:ml-0
        ${index % 2 === 0 ? 'lg:mr-[52%]' : 'lg:ml-[52%]'}
      `}>
        <div
          className={`
            bg-white rounded-xl border border-stone p-5 shadow-soft
            hover:shadow-elevated hover:border-gold/30 transition-all duration-300 cursor-pointer
          `}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {/* Time and category */}
          <div className="flex items-center gap-2 mb-3">
            <span className="font-mono text-xs font-medium bg-gold/10 text-gold px-2.5 py-1 rounded-full">
              {activity.time}
            </span>
            <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${colors.bg} ${colors.text}`}>
              <CategoryIcon className="w-3 h-3" />
              {categoryLabels[activity.category]}
            </span>
            {activity.price && (
              <span className="font-mono text-xs text-terracotta font-medium">
                {activity.price}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="font-serif text-lg md:text-xl text-midnight mb-2 leading-snug">
            {activity.title}
          </h3>

          {/* Location */}
          {activity.location && (
            <div className="flex items-center gap-1.5 text-muted-foreground text-sm mb-3">
              <MapPin className="w-3.5 h-3.5 text-gold" />
              <span>{activity.location}</span>
            </div>
          )}

          {/* Notes */}
          <p className="text-sm text-foreground/80 leading-relaxed mb-3">
            {activity.notes}
          </p>

          {/* Preview image */}
          {activity.image && !isExpanded && (
            <div className="relative rounded-lg overflow-hidden h-32 mb-3">
              <img
                src={activity.image}
                alt={activity.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-midnight/40 to-transparent" />
            </div>
          )}

          {/* Expand hint */}
          {!isExpanded && (activity.funFact || activity.tips || activity.image) && (
            <div className="flex items-center text-gold text-sm font-medium group">
              <span>Ver más detalles</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          )}

          {/* Expanded content */}
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3 }}
              className="mt-4 space-y-4"
            >
              {/* Full image */}
              {activity.image && (
                <div className="relative rounded-lg overflow-hidden">
                  <img
                    src={activity.image}
                    alt={activity.title}
                    className="w-full h-48 object-cover"
                  />
                  <button
                    onClick={(e) => { e.stopPropagation(); setIsExpanded(false); }}
                    className="absolute top-2 right-2 w-8 h-8 bg-midnight/60 hover:bg-midnight text-white rounded-full flex items-center justify-center transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Fun fact */}
              {activity.funFact && (
                <div className="bg-amber-50 border-l-4 border-gold rounded-r-lg p-4">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Sparkles className="w-4 h-4 text-gold" />
                    <span className="font-medium text-sm text-amber-800">Dato curioso</span>
                  </div>
                  <p className="text-sm text-amber-800/80">{activity.funFact}</p>
                </div>
              )}

              {/* Tips */}
              {activity.tips && activity.tips.length > 0 && (
                <div className="bg-garden/5 border-l-4 border-garden rounded-r-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="w-4 h-4 text-garden" />
                    <span className="font-medium text-sm text-garden">Consejos locales</span>
                  </div>
                  <ul className="space-y-1.5">
                    {activity.tips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-garden/80">
                        <ChevronRight className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Price reminder */}
              {activity.price && (
                <div className="flex items-center gap-2 bg-terracotta/5 rounded-lg p-3">
                  <Clock className="w-4 h-4 text-terracotta" />
                  <span className="text-sm text-terracotta font-medium">
                    Recuerda: {activity.price} — compra con antelación si es necesario
                  </span>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
