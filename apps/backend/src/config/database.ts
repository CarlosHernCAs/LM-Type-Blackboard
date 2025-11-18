import { Pool } from 'pg';
import { configValidado } from './env';

export const db = new Pool({
  connectionString: configValidado.databaseUrl,
  max: 20, // Máximo de conexiones concurrentes
  min: 5, // Mínimo de conexiones en el pool
  idleTimeoutMillis: 30000, // Tiempo antes de cerrar conexión inactiva
  connectionTimeoutMillis: 2000, // Timeout para establecer conexión
  allowExitOnIdle: false, // No permitir que el pool se cierre automáticamente
});

// Handle errors
db.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Query helper with error handling
export async function query(text: string, params?: any[]) {
  const start = Date.now();
  try {
    const res = await db.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Database query error', { text, error });
    throw error;
  }
}

export default db;
