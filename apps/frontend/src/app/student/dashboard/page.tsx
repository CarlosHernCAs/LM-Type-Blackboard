'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { BookOpen, ClipboardList, Award, TrendingUp, Calendar, Bell } from 'lucide-react';
import Link from 'next/link';

export default function StudentDashboard() {
  const { user } = useAuth();

  // Fetch student data
  const { data: courses } = useQuery({
    queryKey: ['student-courses'],
    queryFn: async () => {
      const response = await api.get('/courses');
      return response.data;
    },
  });

  const { data: assignments } = useQuery({
    queryKey: ['student-assignments'],
    queryFn: async () => {
      // This would normally fetch assignments for enrolled courses
      return [];
    },
  });

  return (
    <DashboardLayout role="student">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            ¡Bienvenido, {user?.firstName}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Aquí está tu resumen académico
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Cursos Activos"
            value="6"
            icon={<BookOpen className="w-6 h-6" />}
            color="bg-blue-500"
            link="/student/courses"
          />
          <StatCard
            title="Tareas Pendientes"
            value="8"
            icon={<ClipboardList className="w-6 h-6" />}
            color="bg-yellow-500"
            link="/student/assignments"
          />
          <StatCard
            title="Promedio General"
            value="8.5"
            icon={<TrendingUp className="w-6 h-6" />}
            color="bg-green-500"
            link="/student/grades"
          />
          <StatCard
            title="Logros"
            value="12"
            icon={<Award className="w-6 h-6" />}
            color="bg-purple-500"
            link="/student/achievements"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Assignments */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-blue-600" />
              Próximas Tareas
            </h2>
            <div className="space-y-3">
              <AssignmentItem
                title="Ensayo de Historia"
                course="Historia Universal"
                dueDate="Mañana, 11:59 PM"
                status="pending"
              />
              <AssignmentItem
                title="Proyecto de Matemáticas"
                course="Cálculo I"
                dueDate="En 3 días"
                status="in-progress"
              />
              <AssignmentItem
                title="Laboratorio de Química"
                course="Química General"
                dueDate="En 5 días"
                status="not-started"
              />
            </div>
            <Link
              href="/student/assignments"
              className="block mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Ver todas las tareas →
            </Link>
          </div>

          {/* My Courses */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              Mis Cursos
            </h2>
            <div className="space-y-3">
              <CourseItem
                title="Cálculo I"
                instructor="Prof. García"
                progress={75}
                nextClass="Hoy, 10:00 AM"
              />
              <CourseItem
                title="Historia Universal"
                instructor="Prof. Martínez"
                progress={60}
                nextClass="Mañana, 2:00 PM"
              />
              <CourseItem
                title="Química General"
                instructor="Prof. López"
                progress={45}
                nextClass="Miércoles, 9:00 AM"
              />
            </div>
            <Link
              href="/student/courses"
              className="block mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Ver todos los cursos →
            </Link>
          </div>
        </div>

        {/* Calendar & Notifications */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Events */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Próximos Eventos
            </h2>
            <div className="space-y-3">
              <EventItem
                title="Examen de Cálculo"
                date="Viernes, 15:00"
                type="exam"
              />
              <EventItem
                title="Entrega de Proyecto"
                date="Lunes, 23:59"
                type="assignment"
              />
              <EventItem
                title="Clase de Química (Lab)"
                date="Miércoles, 09:00"
                type="class"
              />
            </div>
          </div>

          {/* Recent Notifications */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5 text-blue-600" />
              Notificaciones Recientes
            </h2>
            <div className="space-y-3">
              <NotificationItem
                title="Nueva calificación publicada"
                message="Tu ensayo de Historia ha sido calificado"
                time="Hace 10 min"
              />
              <NotificationItem
                title="Nueva tarea asignada"
                message="Proyecto de Matemáticas - Fecha límite: 5 días"
                time="Hace 2 horas"
              />
              <NotificationItem
                title="Recordatorio de clase"
                message="Clase de Cálculo en 1 hora"
                time="Hace 3 horas"
              />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function StatCard({ title, value, icon, color, link }: any) {
  return (
    <Link href={link}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
            <p className="text-3xl font-bold mt-2 text-gray-900 dark:text-white">{value}</p>
          </div>
          <div className={`${color} text-white p-3 rounded-lg`}>
            {icon}
          </div>
        </div>
      </div>
    </Link>
  );
}

function AssignmentItem({ title, course, dueDate, status }: any) {
  const statusColors = {
    pending: 'bg-red-100 text-red-800',
    'in-progress': 'bg-yellow-100 text-yellow-800',
    'not-started': 'bg-gray-100 text-gray-800',
  };

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
      <div>
        <p className="font-medium text-sm">{title}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{course}</p>
      </div>
      <div className="text-right">
        <p className="text-xs text-gray-500 dark:text-gray-400">{dueDate}</p>
        <span className={`text-xs px-2 py-1 rounded ${statusColors[status as keyof typeof statusColors]}`}>
          {status === 'pending' ? 'Urgente' : status === 'in-progress' ? 'En progreso' : 'Pendiente'}
        </span>
      </div>
    </div>
  );
}

function CourseItem({ title, instructor, progress, nextClass }: any) {
  return (
    <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="font-medium text-sm">{title}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{instructor}</p>
        </div>
        <span className="text-xs font-medium">{progress}%</span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mb-2">
        <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${progress}%` }}></div>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400">Próxima clase: {nextClass}</p>
    </div>
  );
}

function EventItem({ title, date, type }: any) {
  const typeColors = {
    exam: 'bg-red-500',
    assignment: 'bg-yellow-500',
    class: 'bg-blue-500',
  };

  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
      <div className={`w-2 h-2 rounded-full ${typeColors[type as keyof typeof typeColors]}`}></div>
      <div className="flex-1">
        <p className="font-medium text-sm">{title}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{date}</p>
      </div>
    </div>
  );
}

function NotificationItem({ title, message, time }: any) {
  return (
    <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
      <p className="font-medium text-sm">{title}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{message}</p>
      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{time}</p>
    </div>
  );
}
