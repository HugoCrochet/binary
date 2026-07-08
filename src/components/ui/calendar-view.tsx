'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';

interface CalendarEvent {
  date: string;
  label: string;
  institution?: string;
  type?: 'INCOME' | 'EXPENSE';
  amount?: number;
}

interface CalendarViewProps {
  events: CalendarEvent[];
  title?: string;
}

export function CalendarView({ events, title = 'Calendrier des prélèvements' }: CalendarViewProps) {
  // Générer les jours du mois
  const daysInMonth = new Date(2026, 4, 0).getDate(); // Mai 2026
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const getEventForDay = (day: number) => {
    return events.find((e) => {
      const d = new Date(e.date);
      return d.getDate() === day && d.getMonth() === 4; // Mai
    });
  };

  const getDayStyle = (day: number) => {
    const event = getEventForDay(day);
    if (!event) return 'text-gray-400 hover:bg-gray-50';
    if (event.type === 'INCOME') return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200';
    return 'bg-rose-50 text-rose-700 ring-1 ring-rose-200';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-gray-500">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1 text-center">
          {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map((day) => (
            <div key={day} className="text-xs font-medium text-gray-400 py-1">
              {day}
            </div>
          ))}
          {days.map((day) => {
            const event = getEventForDay(day);
            return (
              <div
                key={day}
                className={`relative h-10 w-10 rounded-lg flex items-center justify-center text-sm font-medium cursor-pointer transition-colors ${getDayStyle(day)}`}
              >
                {day}
                {event && (
                  <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2">
                    <div className={`h-1 w-1 rounded-full ${event.type === 'INCOME' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>Entrées</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-rose-500" />
            <span>Sorties</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
