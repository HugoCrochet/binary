'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { formatCurrency } from '@/lib/utils';

interface CashflowEvent {
  id: string;
  name: string;
  amount: number;
  date: string; // ISO date string
  category: string;
  icon?: string;
  isRecurring: boolean;
}

interface CashflowCalendarProps {
  events: CashflowEvent[];
  className?: string;
}

const CATEGORY_COLORS = {
  abonnements: 'bg-yellow-400',
  banque: 'bg-sky-400',
  besoins: 'bg-emerald-400',
  loyer: 'bg-rose-400',
  sorties: 'bg-violet-400',
};

const getCategoryColor = (category: string) => {
  const lower = category.toLowerCase();
  if (lower.includes('abonnement')) return CATEGORY_COLORS.abonnements;
  if (lower.includes('banque')) return CATEGORY_COLORS.banque;
  if (lower.includes('loyer')) return CATEGORY_COLORS.loyer;
  if (lower.includes('sortie')) return CATEGORY_COLORS.sorties;
  return 'bg-gray-400';
};

export function CashflowCalendar({ events, className }: CashflowCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [hoveredDay, setHoveredDay] = useState<{ day: number; events: CashflowEvent[] } | null>(null);

  // Calculer le nombre de jours dans le mois
  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();

  // Premier jour du mois (0 = dimanche, 1 = lundi, etc.)
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  // Générer la grille de jours
  const daysGrid = Array.from({ length: daysInMonth + firstDayOfMonth }, (_, i) => {
    if (i < firstDayOfMonth) return null;
    return i - firstDayOfMonth + 1;
  });

  // Obtenir les événements pour un jour spécifique
  const getEventsForDay = (day: number): CashflowEvent[] => {
    const dayEvents: CashflowEvent[] = [];
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    events.forEach((event) => {
      // Vérifier si l'événement est pour ce jour
      const eventDate = new Date(event.date);
      if (
        eventDate.getFullYear() === currentDate.getFullYear() &&
        eventDate.getMonth() === currentDate.getMonth() &&
        eventDate.getDate() === day
      ) {
        dayEvents.push(event);
      }
    });

    return dayEvents.sort((a, b) => a.amount - b.amount);
  };

  // Calculer le total restant à prélever (échéances après aujourd'hui)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const remainingAmount = events
    .filter((event) => {
      const eventDate = new Date(event.date);
      eventDate.setHours(0, 0, 0, 0);
      return eventDate >= today;
    })
    .reduce((sum, event) => sum + event.amount, 0);

  // Naviguer les mois
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const currentMonthName = currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

  return (
    <Card className={`border-slate-200 shadow-sm ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-gray-700">Échéances du mois</CardTitle>
          <div className="flex items-center gap-2">
            <button
              onClick={prevMonth}
              className="p-1 rounded-md hover:bg-gray-100 text-gray-500 transition-colors"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-sm font-medium text-gray-900 min-w-[120px] text-center">
              {currentMonthName}
            </span>
            <button
              onClick={nextMonth}
              className="p-1 rounded-md hover:bg-gray-100 text-gray-500 transition-colors"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Calendrier Grid */}
        <div className="grid grid-cols-7 gap-1 text-center">
          {/* Jours de la semaine */}
          {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map((day) => (
            <div key={day} className="text-[10px] font-medium text-gray-400 py-1">
              {day.charAt(0)}
            </div>
          ))}

          {/* Jours du mois */}
          {daysGrid.map((day, index) => {
            if (day === null) return <div key={`empty-${index}`} />;

            const dayEvents = getEventsForDay(day);
            const isToday =
              day === new Date().getDate() &&
              currentDate.getMonth() === new Date().getMonth() &&
              currentDate.getFullYear() === new Date().getFullYear();

            const todayDate = new Date();
            const isPast =
              day < todayDate.getDate() &&
              currentDate.getMonth() === todayDate.getMonth() &&
              currentDate.getFullYear() === todayDate.getFullYear();

            return (
              <TooltipProvider key={day} delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className={`
                        relative h-10 w-10 rounded-lg flex items-center justify-center text-xs font-medium transition-colors
                        ${isToday ? 'bg-indigo-100 text-indigo-700' : ''}
                        ${!isToday && !isPast ? 'hover:bg-gray-50 cursor-pointer' : ''}
                        ${isPast ? 'text-gray-300' : 'text-gray-700'}
                      `}
                      onMouseEnter={() => dayEvents.length > 0 && setHoveredDay({ day, events: dayEvents })}
                      onMouseLeave={() => setHoveredDay(null)}
                    >
                      {day}
                      {/* Indicateur de couleur pour les échéances */}
                      {dayEvents.length > 0 && !isPast && (
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2">
                          <div className={`h-1.5 w-1.5 rounded-full ${getCategoryColor(dayEvents[0].category)}`} />
                        </div>
                      )}
                      {/* Indicateur multiple */}
                      {dayEvents.length > 1 && (
                        <div className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-[9px] font-bold text-gray-600">
                            +{dayEvents.length - 1}
                          </span>
                        </div>
                      )}
                    </div>
                  </TooltipTrigger>
                  {dayEvents.length > 0 && (
                    <TooltipContent side="top" className="max-w-[200px]">
                      <div className="space-y-1.5">
                        {dayEvents.map((event) => (
                          <div key={event.id} className="flex items-center justify-between text-xs">
                            <span className="text-gray-700">{event.name}</span>
                            <span className="font-medium text-gray-900">{formatCurrency(event.amount)}</span>
                          </div>
                        ))}
                      </div>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </div>

        {/* Légende */}
        <div className="flex flex-wrap gap-3 text-[10px] text-gray-500 pt-2">
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-yellow-400" />
            <span>Abonnements</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-sky-400" />
            <span>Banque</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-emerald-400" />
            <span>Besoins</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-rose-400" />
            <span>Loyer</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-violet-400" />
            <span>Sorties</span>
          </div>
        </div>

        {/* Total restant */}
        <div className="pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">Total restant ce mois</span>
            <span className="text-sm font-semibold text-gray-900">{formatCurrency(remainingAmount)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
