'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { BookOpen, Users, ClipboardCheck, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function TeacherDashboard() {
  const { user } = useAuth();

  return (
    <DashboardLayout role="teacher">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Bienvenido, Prof. {user?.lastName}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Panel de control del profesor
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Mis Cursos" value="4" icon={<BookOpen className="w-6 h-6" />} color="bg-blue-500" />
          <StatCard title="Estudiantes" value="120" icon={<Users className="w-6 h-6" />} color="bg-green-500" />
          <StatCard title="Tareas por Calificar" value="23" icon={<ClipboardCheck className="w-6 h-6" />} color="bg-yellow-500" />
          <StatCard title="Promedio de Clase" value="7.8" icon={<TrendingUp className="w-6 h-6" />} color="bg-purple-500" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Mis Cursos</h2>
            <div className="space-y-3">
              <CourseCard title="Cálculo I" students={35} assignments={8} />
              <CourseCard title="Álgebra Lineal" students={28} assignments={5} />
              <CourseCard title="Estadística" students={32} assignments={6} />
            </div>
            <Link href="/teacher/courses" className="block mt-4 text-sm text-blue-600 hover:text-blue-700">
              Ver todos los cursos →
            </Link>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Actividad Reciente</h2>
            <div className="space-y-3">
              <ActivityItem text="Juan Pérez entregó tarea de Cálculo" time="Hace 10 min" />
              <ActivityItem text="María García completó examen" time="Hace 1 hora" />
              <ActivityItem text="5 nuevos mensajes sin leer" time="Hace 2 horas" />
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

function CourseCard({ title, students, assignments }: any) {
  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
      <h3 className="font-medium mb-2">{title}</h3>
      <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400">
        <span>{students} estudiantes</span>
        <span>{assignments} tareas</span>
      </div>
    </div>
  );
}

function ActivityItem({ text, time }: any) {
  return (
    <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
      <p className="text-sm">{text}</p>
      <p className="text-xs text-gray-500 mt-1">{time}</p>
    </div>
  );
}
