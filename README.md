# 🎓 EduVerse LMS

> Sistema de Gestión de Aprendizaje moderno con IA integrada - La plataforma educativa del futuro

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/typescript-5.3-blue.svg)](https://www.typescriptlang.org/)

## 📋 Descripción

**EduVerse** es una plataforma de gestión de aprendizaje (LMS) moderna diseñada para colegios públicos y privados. Combina las mejores características de sistemas como Moodle, Canvas y Blackboard, pero con una arquitectura moderna, IA integrada y una experiencia de usuario superior.

### ✨ Características Principales

- 🎯 **Todo en un solo lugar**: LMS completo + SIS + Portal de Padres + Comunicación
- 🤖 **IA Nativa**: Asistente virtual, corrección automática, recomendaciones personalizadas
- 📱 **Mobile First**: Apps nativas + acceso offline
- 🎮 **Gamificación**: Puntos, badges, leaderboards, logros
- 📊 **Analytics Avanzado**: Dashboards en tiempo real, predicciones, alertas tempranas
- 🔗 **Integraciones**: Google Workspace, Microsoft 365, Zoom, Stripe
- 🌍 **Multi-idioma**: Soporte para español, inglés y más
- ♿ **Accesible**: Cumple con WCAG 2.1 AA

## 🏗️ Arquitectura

### Stack Tecnológico

**Frontend:**
- Next.js 14 (React 19)
- TypeScript
- Tailwind CSS + shadcn/ui
- TanStack Query + Zustand
- React Hook Form + Zod

**Backend:**
- Node.js + Fastify
- TypeScript
- PostgreSQL 16
- Redis 7
- MongoDB (contenido)

**Infraestructura:**
- Docker + Docker Compose
- MinIO (S3-compatible)
- Elasticsearch
- WebSockets (Socket.io)

**IA & ML:**
- OpenAI API (GPT-4)
- LangChain

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js >= 20.0.0
- npm >= 10.0.0
- Docker & Docker Compose
- Git

### Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/CarlosHernCAs/LM-Type-Blackboard.git
cd LM-Type-Blackboard
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env
# Editar .env con tus configuraciones
```

4. **Iniciar servicios con Docker**
```bash
npm run docker:up
```

Esto iniciará:
- PostgreSQL (puerto 5432)
- Redis (puerto 6379)
- MongoDB (puerto 27017)
- MinIO (puertos 9000, 9001)
- Elasticsearch (puerto 9200)

5. **Ejecutar migraciones de base de datos**
```bash
npm run db:migrate
```

6. **Iniciar en modo desarrollo**
```bash
npm run dev
```

Esto iniciará:
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000
- API Docs: http://localhost:4000/docs

### Usuarios de Prueba

El sistema incluye usuarios de prueba (solo en desarrollo):

| Usuario | Email | Password | Rol |
|---------|-------|----------|-----|
| admin | admin@eduverse.com | admin123 | Administrador |
| teacher | teacher@eduverse.com | teacher123 | Profesor |
| student | student@eduverse.com | student123 | Estudiante |

## 📁 Estructura del Proyecto

```
LM-Type-Blackboard/
├── apps/
│   ├── frontend/          # Next.js app
│   │   ├── src/
│   │   │   ├── app/      # App router pages
│   │   │   ├── components/
│   │   │   ├── lib/      # Utils y helpers
│   │   │   ├── hooks/    # React hooks
│   │   │   └── types/    # TypeScript types
│   │   └── package.json
│   │
│   └── backend/           # Fastify API
│       ├── src/
│       │   ├── config/   # Configuración
│       │   ├── routes/   # API routes
│       │   ├── controllers/
│       │   ├── services/
│       │   ├── middleware/
│       │   └── types/
│       └── package.json
│
├── database/
│   └── init.sql          # Schema de base de datos
│
├── docker-compose.yml    # Servicios Docker
├── package.json          # Workspace root
├── turbo.json           # Turbo config
└── README.md
```

## 🗄️ Base de Datos

### Esquema Principal

El sistema incluye las siguientes tablas principales:

- **users**: Usuarios del sistema
- **student_profiles**: Perfiles de estudiantes
- **teacher_profiles**: Perfiles de profesores
- **courses**: Cursos
- **course_modules**: Módulos de cursos
- **lessons**: Lecciones/contenido
- **enrollments**: Inscripciones
- **assignments**: Tareas
- **submissions**: Entregas
- **grades**: Calificaciones
- **attendance**: Asistencia
- **forums**: Foros de discusión
- **forum_posts**: Posts en foros
- **messages**: Mensajería directa
- **notifications**: Notificaciones
- **announcements**: Anuncios
- **calendar_events**: Eventos de calendario
- **achievements**: Logros (gamificación)
- **user_achievements**: Logros de usuarios
- **transactions**: Transacciones de pago
- **ai_interactions**: Log de interacciones con IA
- **audit_logs**: Auditoría

## 🔌 API Endpoints

### Autenticación
```
POST   /api/v1/auth/login       - Iniciar sesión
POST   /api/v1/auth/register    - Registrarse
GET    /api/v1/auth/me          - Usuario actual
```

### Usuarios
```
GET    /api/v1/users            - Listar usuarios (admin)
GET    /api/v1/users/:id        - Obtener usuario
```

### Cursos
```
GET    /api/v1/courses          - Listar cursos
GET    /api/v1/courses/:id      - Obtener curso
POST   /api/v1/courses          - Crear curso (teacher/admin)
```

### Tareas
```
GET    /api/v1/assignments/course/:courseId  - Tareas de un curso
GET    /api/v1/assignments/:id               - Obtener tarea
```

Ver documentación completa en: http://localhost:4000/docs

## 🧪 Testing

```bash
# Ejecutar tests
npm test

# Tests con coverage
npm run test:coverage

# Tests en modo watch
npm run test:watch
```

## 📦 Build para Producción

```bash
# Build de todo el proyecto
npm run build

# Build solo frontend
cd apps/frontend && npm run build

# Build solo backend
cd apps/backend && npm run build
```

## 🐳 Docker

### Iniciar servicios
```bash
npm run docker:up
```

### Detener servicios
```bash
npm run docker:down
```

### Ver logs
```bash
docker-compose logs -f
```

### Reiniciar un servicio
```bash
docker-compose restart postgres
```

## 🛠️ Scripts Disponibles

```bash
npm run dev          # Desarrollo (frontend + backend)
npm run build        # Build producción
npm run test         # Tests
npm run lint         # Linting
npm run format       # Format código
npm run docker:up    # Iniciar Docker
npm run docker:down  # Detener Docker
npm run db:migrate   # Migraciones DB
npm run db:seed      # Seed DB
```

## 🔐 Seguridad

- Contraseñas hasheadas con bcrypt
- JWT para autenticación
- Rate limiting en API
- CORS configurado
- SQL injection protection (prepared statements)
- XSS protection
- CSRF tokens
- Encriptación de datos sensibles

## 🌍 Variables de Entorno

Ver `.env.example` para todas las variables disponibles.

Variables críticas:
- `DATABASE_URL`: URL de PostgreSQL
- `JWT_SECRET`: Secret para JWT (cambiar en producción!)
- `OPENAI_API_KEY`: API key de OpenAI
- `STRIPE_SECRET_KEY`: API key de Stripe

## 📝 Roadmap

### MVP (3-4 meses)
- [x] Autenticación y usuarios
- [x] Cursos básicos
- [x] Tareas y entregas
- [ ] Calificaciones
- [ ] Chat básico

### Core (4-6 meses)
- [ ] Video conferencia
- [ ] Foros
- [ ] Portal de padres
- [ ] App móvil
- [ ] Analytics básico

### Avanzado (6-8 meses)
- [ ] IA personalización
- [ ] Gamificación completa
- [ ] Analytics predictivo
- [ ] Detección de plagio

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 👥 Autores

- **Carlos Hernández** - *Desarrollo Inicial* - [CarlosHernCAs](https://github.com/CarlosHernCAs)

## 🙏 Agradecimientos

- Inspirado en Moodle, Canvas, y Blackboard
- Comunidad de Next.js y Fastify
- Todos los contribuidores

## 📞 Soporte

- 📧 Email: support@eduverse.com
- 💬 Discord: [Link al servidor]
- 📖 Docs: [Link a documentación]
- 🐛 Issues: [GitHub Issues](https://github.com/CarlosHernCAs/LM-Type-Blackboard/issues)

---

⭐ Si te gusta este proyecto, dale una estrella en GitHub!
