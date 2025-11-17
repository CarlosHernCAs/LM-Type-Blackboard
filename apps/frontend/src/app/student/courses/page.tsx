'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { BookOpen, Users, Clock } from 'lucide-react';
import Link from 'next/link';

export default function StudentCoursesPage() {
  const { data: courses, isLoading } = useQuery({
    queryKey: ['my-courses'],
    queryFn: async () => {
      const response = await api.get('/enrollments/my');
      return response.data;
    },
  });

  return (
    <DashboardLayout role="student">
      <div>
        <h1 className="text-3xl font-bold mb-6">Mis Cursos</h1>

        {isLoading ? (
          <div>Cargando cursos...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses?.map((course: any) => (
              <Link key={course.id} href={`/courses/${course.course_id}`}>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition p-6 cursor-pointer">
                  <div className="w-full h-32 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg mb-4"></div>
                  <h3 className="text-xl font-semibold mb-2">{course.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                    {course.description}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      Profesor: {course.first_name} {course.last_name}
                    </span>
                  </div>
                  <div className="mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${course.progress_percentage || 0}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {course.progress_percentage || 0}% completado
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-8">
          <Link href="/courses/browse">
            <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Explorar Más Cursos
            </button>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
