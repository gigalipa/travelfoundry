import { motion } from 'framer-motion';
import { Euro, Train, Utensils, Ticket, ShoppingBag } from 'lucide-react';
import type { Day } from '@/data/itinerary';
import { getTotalExpenses, getTripTotalExpenses } from '@/data/itinerary';

interface ExpensesSectionProps {
  days: Day[];
}

export function ExpensesSection({ days }: ExpensesSectionProps) {
  const tripTotal = getTripTotalExpenses(days);

  const categoryIcons = {
    transport: { icon: Train, color: 'bg-blue-500', label: 'Transporte' },
    food: { icon: Utensils, color: 'bg-green-500', label: 'Comida' },
    tickets: { icon: Ticket, color: 'bg-amber-500', label: 'Entradas' },
    other: { icon: ShoppingBag, color: 'bg-purple-500', label: 'Otros' },
  };

  const categoryTotals = days.reduce(
    (acc, day) => {
      acc.transport += day.expenses.transport;
      acc.food += day.expenses.food;
      acc.tickets += day.expenses.tickets;
      acc.other += day.expenses.other;
      return acc;
    },
    { transport: 0, food: 0, tickets: 0, other: 0 }
  );

  return (
    <section className="bg-white rounded-xl border border-stone p-6 md:p-8 shadow-soft">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center">
          <Euro className="w-5 h-5 text-gold" />
        </div>
        <div>
          <h2 className="font-serif text-2xl text-midnight">Resumen de gastos</h2>
          <p className="text-sm text-muted-foreground">Presupuesto estimado del viaje</p>
        </div>
      </div>

      {/* Total */}
      <div className="bg-midnight rounded-xl p-6 text-white mb-6">
        <p className="text-white/60 text-sm mb-1">Gasto total estimado</p>
        <p className="font-serif text-4xl font-medium">{tripTotal}€</p>
        <p className="text-white/50 text-sm mt-1">Para {days.length} días de viaje</p>
      </div>

      {/* Category breakdown */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {Object.entries(categoryTotals).map(([key, value]) => {
          const config = categoryIcons[key as keyof typeof categoryIcons];
          const Icon = config.icon;
          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-cream rounded-lg p-4 text-center"
            >
              <div className={`w-8 h-8 ${config.color} rounded-full flex items-center justify-center mx-auto mb-2`}>
                <Icon className="w-4 h-4 text-white" />
              </div>
              <p className="font-mono text-lg font-medium text-midnight">{value}€</p>
              <p className="text-xs text-muted-foreground">{config.label}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Daily bars */}
      <div className="space-y-4">
        <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Por día</h3>
        {days.map((day, index) => {
          const total = getTotalExpenses(day);
          const maxTotal = Math.max(...days.map(getTotalExpenses));
          const percentage = maxTotal > 0 ? (total / maxTotal) * 100 : 0;

          return (
            <motion.div
              key={day.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-medium text-midnight">
                  {day.dayNumber === 0 ? 'Llegada' : `Día ${day.dayNumber}`}
                </span>
                <span className="font-mono text-sm text-muted-foreground">{total}€</span>
              </div>
              <div className="h-8 bg-cream rounded-lg overflow-hidden flex">
                {total > 0 ? (
                  <>
                    {day.expenses.transport > 0 && (
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(day.expenses.transport / total) * percentage}%` }}
                        transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }}
                        className="h-full bg-blue-500"
                        title={`Transporte: ${day.expenses.transport}€`}
                      />
                    )}
                    {day.expenses.food > 0 && (
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(day.expenses.food / total) * percentage}%` }}
                        transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                        className="h-full bg-green-500"
                        title={`Comida: ${day.expenses.food}€`}
                      />
                    )}
                    {day.expenses.tickets > 0 && (
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(day.expenses.tickets / total) * percentage}%` }}
                        transition={{ delay: 0.4 + index * 0.1, duration: 0.5 }}
                        className="h-full bg-amber-500"
                        title={`Entradas: ${day.expenses.tickets}€`}
                      />
                    )}
                    {day.expenses.other > 0 && (
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(day.expenses.other / total) * percentage}%` }}
                        transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                        className="h-full bg-purple-500"
                        title={`Otros: ${day.expenses.other}€`}
                      />
                    )}
                  </>
                ) : (
                  <span className="text-xs text-muted-foreground px-2 flex items-center">Sin gastos planificados</span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
