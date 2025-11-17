'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Users, BookOpen, TrendingUp, Calendar } from 'lucide-react';

export default function ParentDashboard() {
  const { user } = useAuth();

  return (
    <DashboardLayout role="parent">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Portal de Padres</h1>
          <p className="text-gray-600 mt-1">Monitorea el progreso de tus hijos</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="font-semibold mb-4">Juan Pérez (Hijo)</h3>
            <div className="space-y-2">
              <StatItem label="Promedio General" value="8.5" />
              <StatItem label="Asistencia" value="95%" />
              <StatItem label="Tareas Completadas" value="24/26" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="font-semibold mb-4">María Pérez (Hija)</h3>
            <div className="space-y-2">
              <StatItem label="Promedio General" value="9.2" />
              <StatItem label="Asistencia" value="98%" />
              <StatItem label="Tareas Completadas" value="28/28" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="font-semibold mb-4">Próximos Eventos</h3>
            <div className="space-y-2 text-sm">
              <EventItem title="Reunión de Padres" date="Viernes 10:00 AM" />
              <EventItem title="Entrega de Boletines" date="Lunes 15:00 PM" />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function StatItem({ label, value }: any) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-600">{label}:</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}

function EventItem({ title, date }: any) {
  return (
    <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded">
      <p className="font-medium text-sm">{title}</p>
      <p className="text-xs text-gray-500">{date}</p>
    </div>
  );
}
