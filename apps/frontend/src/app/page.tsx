import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BookOpen, Users, GraduationCap, TrendingUp } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 py-20 sm:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl sm:text-6xl font-bold tracking-tight mb-6">
              Bienvenido a{' '}
              <span className="text-blue-600 dark:text-blue-400">EduVerse</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Plataforma de gestión de aprendizaje moderna con IA integrada. Todo lo que necesitas
              para enseñar y aprender en un solo lugar.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/auth/login">
                <Button size="lg" className="text-lg px-8">
                  Iniciar Sesión
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button size="lg" variant="outline" className="text-lg px-8">
                  Registrarse
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Características Principales
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<BookOpen className="w-10 h-10" />}
              title="Cursos Completos"
              description="Crea y gestiona cursos con contenido multimedia, exámenes y tareas."
            />
            <FeatureCard
              icon={<Users className="w-10 h-10" />}
              title="Colaboración"
              description="Foros, chat en tiempo real y video conferencias integradas."
            />
            <FeatureCard
              icon={<GraduationCap className="w-10 h-10" />}
              title="IA Integrada"
              description="Asistente virtual, corrección automática y recomendaciones personalizadas."
            />
            <FeatureCard
              icon={<TrendingUp className="w-10 h-10" />}
              title="Analytics Avanzado"
              description="Dashboards, reportes y predicciones de rendimiento estudiantil."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 dark:bg-blue-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">¿Listo para comenzar?</h2>
          <p className="text-xl mb-8 opacity-90">
            Únete a miles de estudiantes y profesores que ya usan EduVerse
          </p>
          <Link href="/auth/register">
            <Button size="lg" variant="secondary" className="text-lg px-8">
              Crear Cuenta Gratis
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4">EduVerse</h3>
              <p className="text-gray-400">
                Plataforma educativa moderna para colegios públicos y privados.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Producto</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/features">Características</Link>
                </li>
                <li>
                  <Link href="/pricing">Precios</Link>
                </li>
                <li>
                  <Link href="/demo">Demo</Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Recursos</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/docs">Documentación</Link>
                </li>
                <li>
                  <Link href="/support">Soporte</Link>
                </li>
                <li>
                  <Link href="/blog">Blog</Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/privacy">Privacidad</Link>
                </li>
                <li>
                  <Link href="/terms">Términos</Link>
                </li>
                <li>
                  <Link href="/contact">Contacto</Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 EduVerse. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="p-6 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
      <div className="text-blue-600 dark:text-blue-400 mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300">{description}</p>
    </div>
  );
}
