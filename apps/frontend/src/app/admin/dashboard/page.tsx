'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Users, BookOpen, TrendingUp, DollarSign } from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Panel de Administración
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Bienvenido, {user?.firstName}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total Usuarios" value="1,245" icon={<Users className="w-6 h-6" />} color="bg-blue-500" />
          <StatCard title="Cursos Activos" value="48" icon={<BookOpen className="w-6 h-6" />} color="bg-green-500" />
          <StatCard title="Tasa de Retención" value="92%" icon={<TrendingUp className="w-6 h-6" />} color="bg-purple-500" />
          <StatCard title="Ingresos Mensuales" value="$45,230" icon={<DollarSign className="w-6 h-6" />} color="bg-yellow-500" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Usuarios por Rol</h2>
            <div className="space-y-3">
              <UserRoleCard role="Estudiantes" count={980} percentage={78} />
              <UserRoleCard role="Profesores" count={52} percentage={4} />
              <UserRoleCard role="Padres" count={213} percentage={18} />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Actividad del Sistema</h2>
            <div className="space-y-3">
              <ActivityStat label="Usuarios activos hoy" value="823" />
              <ActivityStat label="Tareas entregadas hoy" value="156" />
              <ActivityStat label="Nuevos registros" value="12" />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function StatCard({ title, value, icon, color }: any) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
        </div>
        <div className={`${color} text-white p-3 rounded-lg`}>{icon}</div>
      </div>
    </div>
  );
}

function UserRoleCard({ role, count, percentage }: any) {
  return (
    <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
      <div className="flex justify-between mb-2">
        <span className="font-medium">{role}</span>
        <span className="text-sm">{count}</span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
        <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  );
}

function ActivityStat({ label, value }: any) {
  return (
    <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
      <span className="text-sm">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
