import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Train, Ticket, CupSoda, MapPin, Wallet, Utensils, Info } from 'lucide-react';
import type { TripData } from '@/data/itinerary';

const categoryIcons: Record<string, React.ElementType> = {
  train: Train,
  ticket: Ticket,
  'cup-soda': CupSoda,
  'map-pin': MapPin,
  wallet: Wallet,
  utensils: Utensils,
  info: Info,
};

const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
  transport: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  food: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  reservations: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  money: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  general: { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' },
};

interface TipsSectionProps {
  tips: TripData['tips'];
}

export function TipsSection({ tips }: TipsSectionProps) {
  const [checkedTips, setCheckedTips] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set();
    const saved = localStorage.getItem('paris-checked-tips');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  const toggleTip = (tipId: string) => {
    const newSet = new Set(checkedTips);
    if (newSet.has(tipId)) {
      newSet.delete(tipId);
    } else {
      newSet.add(tipId);
    }
    setCheckedTips(newSet);
    localStorage.setItem('paris-checked-tips', JSON.stringify([...newSet]));
  };

  const progress = (checkedTips.size / tips.length) * 100;

  return (
    <section className="bg-white rounded-xl border border-stone p-6 md:p-8 shadow-soft">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-garden/10 flex items-center justify-center">
          <Info className="w-5 h-5 text-garden" />
        </div>
        <div className="flex-1">
          <h2 className="font-serif text-2xl text-midnight">Consejos prácticos</h2>
          <p className="text-sm text-muted-foreground">Revisa estos tips antes y durante tu viaje</p>
        </div>
        <div className="text-right">
          <p className="font-mono text-2xl font-medium text-garden">{checkedTips.size}/{tips.length}</p>
          <p className="text-xs text-muted-foreground">revisados</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-cream rounded-full mb-6 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
          className="h-full bg-garden rounded-full"
        />
      </div>

      {/* Tips grid */}
      <div className="grid md:grid-cols-2 gap-3">
        {tips.map((tip, index) => {
          const isChecked = checkedTips.has(tip.id);
          const colors = categoryColors[tip.category] || categoryColors.general;
          const Icon = categoryIcons[tip.icon] || Info;

          return (
            <motion.button
              key={tip.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              onClick={() => toggleTip(tip.id)}
              className={`
                relative text-left p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer
                ${isChecked ? 'border-garden/30 bg-garden/5' : 'border-stone bg-white hover:border-gold/20'}
              `}
            >
              <div className="flex items-start gap-3">
                <div className={`
                  w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors
                  ${isChecked ? 'bg-garden border-garden' : 'border-stone'}
                `}>
                  {isChecked && <Check className="w-3.5 h-3.5 text-white" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${colors.bg} ${colors.text}`}>
                      <Icon className="w-3 h-3" />
                    </span>
                    <h3 className={`font-medium text-sm ${isChecked ? 'text-garden line-through' : 'text-midnight'}`}>
                      {tip.title}
                    </h3>
                  </div>
                  <p className={`text-sm leading-relaxed ${isChecked ? 'text-garden/60' : 'text-muted-foreground'}`}>
                    {tip.description}
                  </p>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}
