'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Home,
  BookOpen,
  ClipboardList,
  MessageSquare,
  Calendar,
  Users,
  Settings,
  BarChart,
  FileText,
  Award,
  Upload
} from 'lucide-react';

interface SidebarProps {
  role: 'student' | 'teacher' | 'admin' | 'parent';
}

const studentLinks = [
  { href: '/student/dashboard', label: 'Dashboard', icon: Home },
  { href: '/student/courses', label: 'Mis Cursos', icon: BookOpen },
  { href: '/student/assignments', label: 'Tareas', icon: ClipboardList },
  { href: '/student/grades', label: 'Calificaciones', icon: BarChart },
  { href: '/student/calendar', label: 'Calendario', icon: Calendar },
  { href: '/student/messages', label: 'Mensajes', icon: MessageSquare },
  { href: '/student/achievements', label: 'Logros', icon: Award },
];

const teacherLinks = [
  { href: '/teacher/dashboard', label: 'Dashboard', icon: Home },
  { href: '/teacher/courses', label: 'Mis Cursos', icon: BookOpen },
  { href: '/teacher/assignments', label: 'Tareas', icon: ClipboardList },
  { href: '/teacher/students', label: 'Estudiantes', icon: Users },
  { href: '/teacher/grades', label: 'Calificaciones', icon: BarChart },
  { href: '/teacher/calendar', label: 'Calendario', icon: Calendar },
  { href: '/teacher/messages', label: 'Mensajes', icon: MessageSquare },
  { href: '/teacher/resources', label: 'Recursos', icon: Upload },
];

const adminLinks = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: Home },
  { href: '/admin/users', label: 'Usuarios', icon: Users },
  { href: '/admin/courses', label: 'Cursos', icon: BookOpen },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart },
  { href: '/admin/reports', label: 'Reportes', icon: FileText },
  { href: '/admin/calendar', label: 'Calendario', icon: Calendar },
  { href: '/admin/messages', label: 'Mensajes', icon: MessageSquare },
  { href: '/admin/settings', label: 'Configuración', icon: Settings },
];

const parentLinks = [
  { href: '/parent/dashboard', label: 'Dashboard', icon: Home },
  { href: '/parent/children', label: 'Mis Hijos', icon: Users },
  { href: '/parent/courses', label: 'Cursos', icon: BookOpen },
  { href: '/parent/grades', label: 'Calificaciones', icon: BarChart },
  { href: '/parent/calendar', label: 'Calendario', icon: Calendar },
  { href: '/parent/messages', label: 'Mensajes', icon: MessageSquare },
];

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();

  const links = {
    student: studentLinks,
    teacher: teacherLinks,
    admin: adminLinks,
    parent: parentLinks,
  }[role];

  return (
    <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 min-h-[calc(100vh-4rem)]">
      <nav className="p-4 space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              )}
            >
              <Icon className="w-5 h-5" />
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
