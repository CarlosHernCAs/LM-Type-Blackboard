# Guía de Desarrollo

## Setup Inicial

### 1. Prerrequisitos

Instalar en tu máquina:
- Node.js >= 20.0.0 (recomendado usar [nvm](https://github.com/nvm-sh/nvm))
- npm >= 10.0.0
- Docker Desktop
- Git
- Editor de código (recomendado: VS Code)

### 2. Clonar e Instalar

```bash
# Clonar repositorio
git clone https://github.com/CarlosHernCAs/LM-Type-Blackboard.git
cd LM-Type-Blackboard

# Instalar dependencias (monorepo)
npm install
```

### 3. Variables de Entorno

```bash
# Copiar ejemplo
cp .env.example .env

# Editar .env con tus configuraciones
nano .env
```

Variables importantes para desarrollo:
```env
DATABASE_URL="postgresql://eduverse:eduverse123@localhost:5432/eduverse_db"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="dev-secret-change-in-production"
NODE_ENV="development"
```

### 4. Iniciar Servicios

```bash
# Iniciar Docker Compose (PostgreSQL, Redis, etc.)
npm run docker:up

# Esperar ~30 segundos para que servicios estén listos

# Ejecutar migraciones de base de datos
npm run db:migrate

# (Opcional) Poblar con datos de prueba
npm run db:seed
```

### 5. Iniciar en Desarrollo

```bash
# Terminal 1: Iniciar todo (frontend + backend)
npm run dev

# O iniciar por separado:

# Terminal 1: Backend
cd apps/backend
npm run dev

# Terminal 2: Frontend
cd apps/frontend
npm run dev
```

Servicios disponibles:
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000
- API Docs: http://localhost:4000/docs
- MinIO Console: http://localhost:9001

## Flujo de Trabajo

### Crear Nueva Feature

1. **Crear rama desde main**
```bash
git checkout main
git pull origin main
git checkout -b feature/nombre-feature
```

2. **Desarrollar**
```bash
# Hacer cambios
# Guardar frecuentemente
git add .
git commit -m "feat: descripción corta"
```

3. **Testing**
```bash
# Ejecutar tests
npm test

# Verificar linting
npm run lint

# Formatear código
npm run format
```

4. **Pull Request**
```bash
git push origin feature/nombre-feature
# Crear PR en GitHub
```

### Estructura de Commits

Usar [Conventional Commits](https://www.conventionalcommits.org/):

```bash
feat: nueva característica
fix: corregir bug
docs: cambios en documentación
style: formateo, punto y coma, etc
refactor: refactoring
test: agregar tests
chore: tareas de mantenimiento
```

Ejemplos:
```bash
git commit -m "feat(auth): agregar login con Google"
git commit -m "fix(courses): corregir filtro de búsqueda"
git commit -m "docs: actualizar README con setup"
```

## Desarrollo Frontend

### Crear Nuevo Componente

```bash
# Ubicación
apps/frontend/src/components/ui/MiComponente.tsx
```

Template:
```tsx
import { cn } from '@/lib/utils';

interface MiComponenteProps {
  className?: string;
  // otras props
}

export function MiComponente({ className }: MiComponenteProps) {
  return (
    <div className={cn('base-classes', className)}>
      {/* contenido */}
    </div>
  );
}
```

### Crear Nueva Página

```bash
# Ubicación (App Router)
apps/frontend/src/app/ruta/page.tsx
```

Template:
```tsx
export default function MiPagina() {
  return (
    <div>
      <h1>Mi Página</h1>
    </div>
  );
}
```

### Hacer Request a API

```tsx
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

function MiComponente() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const response = await api.get('/courses');
      return response.data;
    },
  });

  if (isLoading) return <div>Cargando...</div>;
  if (error) return <div>Error</div>;

  return <div>{/* usar data */}</div>;
}
```

## Desarrollo Backend

### Crear Nueva Ruta

```bash
# Ubicación
apps/backend/src/routes/mi-recurso.routes.ts
```

Template:
```typescript
import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { db } from '../config/database';

const createSchema = z.object({
  name: z.string().min(1),
  // otros campos
});

export default async function miRecursoRoutes(fastify: FastifyInstance) {
  // Requiere autenticación
  fastify.addHook('onRequest', fastify.authenticate);

  // GET /mi-recurso
  fastify.get('/', async (request, reply) => {
    const result = await db.query('SELECT * FROM mi_tabla');
    return result.rows;
  });

  // POST /mi-recurso
  fastify.post('/', async (request, reply) => {
    const body = createSchema.parse(request.body);
    const result = await db.query(
      'INSERT INTO mi_tabla (name) VALUES ($1) RETURNING *',
      [body.name]
    );
    return reply.code(201).send(result.rows[0]);
  });
}
```

Registrar en `apps/backend/src/routes/index.ts`:
```typescript
import miRecursoRoutes from './mi-recurso.routes';

fastify.register(miRecursoRoutes, { prefix: '/mi-recurso' });
```

### Consultas a Base de Datos

```typescript
// SELECT
const result = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
const user = result.rows[0];

// INSERT
const result = await db.query(
  'INSERT INTO users (email, name) VALUES ($1, $2) RETURNING *',
  [email, name]
);

// UPDATE
await db.query(
  'UPDATE users SET name = $1 WHERE id = $2',
  [newName, userId]
);

// DELETE
await db.query('DELETE FROM users WHERE id = $1', [userId]);
```

## Base de Datos

### Ejecutar Migraciones

```bash
npm run db:migrate
```

### Crear Nueva Migración

1. Editar `database/init.sql`
2. Ejecutar migración
3. Verificar cambios

### Conectarse a PostgreSQL

```bash
# Via Docker
docker exec -it eduverse-postgres psql -U eduverse -d eduverse_db

# O instalar psql localmente
psql postgresql://eduverse:eduverse123@localhost:5432/eduverse_db
```

Comandos útiles:
```sql
-- Listar tablas
\dt

-- Describir tabla
\d users

-- Query
SELECT * FROM users LIMIT 5;
```

## Testing

### Frontend Tests

```bash
cd apps/frontend
npm test
```

Ejemplo de test:
```typescript
import { render, screen } from '@testing-library/react';
import { Button } from './button';

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
});
```

### Backend Tests

```bash
cd apps/backend
npm test
```

Ejemplo de test:
```typescript
import { test } from '@jest/globals';
import { build } from '../helper';

test('GET /health should return 200', async () => {
  const app = await build();
  const response = await app.inject({
    method: 'GET',
    url: '/health',
  });

  expect(response.statusCode).toBe(200);
  expect(response.json()).toHaveProperty('status', 'ok');
});
```

## Debugging

### Frontend (Next.js)

1. Agregar `debugger;` en tu código
2. Abrir Chrome DevTools
3. Navegar a la página
4. El debugger se pausará

O usar VS Code:
```json
// .vscode/launch.json
{
  "type": "node",
  "request": "launch",
  "name": "Next.js: debug",
  "runtimeExecutable": "npm",
  "runtimeArgs": ["run", "dev"],
  "console": "integratedTerminal"
}
```

### Backend (Fastify)

```bash
# Iniciar con inspector
node --inspect src/index.ts

# O con tsx
tsx --inspect src/index.ts
```

Conectar desde Chrome: `chrome://inspect`

## Troubleshooting

### Puerto en uso

```bash
# Encontrar proceso en puerto 3000
lsof -i :3000

# Matar proceso
kill -9 <PID>
```

### Docker no inicia

```bash
# Detener todo
docker-compose down

# Limpiar volúmenes
docker-compose down -v

# Reiniciar
docker-compose up -d
```

### Problemas con node_modules

```bash
# Limpiar todo
npm run clean

# Reinstalar
npm install
```

### Base de datos vacía

```bash
# Re-ejecutar migraciones
npm run db:migrate

# Poblar con datos
npm run db:seed
```

## VS Code Extensions Recomendadas

- ESLint
- Prettier
- TypeScript and JavaScript Language Features
- Tailwind CSS IntelliSense
- Docker
- GitLens
- Error Lens
- Better Comments
- Auto Rename Tag
- Path Intellisense

## Recursos Útiles

- [Next.js Docs](https://nextjs.org/docs)
- [Fastify Docs](https://www.fastify.io/docs/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [TailwindCSS Docs](https://tailwindcss.com/docs)
- [React Query Docs](https://tanstack.com/query/latest)
