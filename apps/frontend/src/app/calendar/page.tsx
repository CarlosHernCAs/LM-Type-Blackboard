'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useState } from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { es } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const locales = { es };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export default function CalendarPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    eventType: 'class',
    startTime: '',
    endTime: '',
  });

  const { data: events } = useQuery({
    queryKey: ['calendar-events'],
    queryFn: async () => {
      const response = await api.get('/calendar');
      return response.data.map((e: any) => ({
        ...e,
        start: new Date(e.start_time),
        end: new Date(e.end_time),
      }));
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/calendar', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      setShowModal(false);
      setNewEvent({ title: '', description: '', eventType: 'class', startTime: '', endTime: '' });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(newEvent);
  };

  const roleBasedLayout = user?.role === 'student' ? 'student' : user?.role === 'teacher' ? 'teacher' : user?.role === 'admin' ? 'admin' : 'parent';

  return (
    <DashboardLayout role={roleBasedLayout as any}>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Calendario</h1>
          <Button onClick={() => setShowModal(true)}>Crear Evento</Button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6" style={{ height: '600px' }}>
          <BigCalendar
            localizer={localizer}
            events={events || []}
            startAccessor="start"
            endAccessor="end"
            culture="es"
          />
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
              <h2 className="text-2xl font-bold mb-4">Crear Evento</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Título</Label>
                  <Input
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Descripción</Label>
                  <textarea
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                    className="w-full border rounded p-2"
                    rows={3}
                  />
                </div>
                <div>
                  <Label>Tipo</Label>
                  <select
                    value={newEvent.eventType}
                    onChange={(e) => setNewEvent({ ...newEvent, eventType: e.target.value })}
                    className="w-full border rounded p-2"
                  >
                    <option value="class">Clase</option>
                    <option value="exam">Examen</option>
                    <option value="assignment">Tarea</option>
                    <option value="meeting">Reunión</option>
                  </select>
                </div>
                <div>
                  <Label>Inicio</Label>
                  <Input
                    type="datetime-local"
                    value={newEvent.startTime}
                    onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Fin</Label>
                  <Input
                    type="datetime-local"
                    value={newEvent.endTime}
                    onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                    required
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">Crear</Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
