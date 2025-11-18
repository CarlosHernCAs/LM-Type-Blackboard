import { Pool } from 'pg';
import { BaseService } from './base.service';
import { User, UpdateUserDTO, UserRole } from '../models';

export class UserService extends BaseService {
  constructor(db: Pool) {
    super(db);
  }

  async obtenerPorId(id: string): Promise<Omit<User, 'password_hash'> | null> {
    return this.queryOne<User>(
      `SELECT id, username, email, role, first_name, last_name, phone,
              date_of_birth, address, profile_picture_url, is_active,
              last_login, created_at, updated_at
       FROM users
       WHERE id = $1`,
      [id]
    );
  }

  async obtenerTodos(rol?: UserRole, activo?: boolean): Promise<Omit<User, 'password_hash'>[]> {
    let condiciones: string[] = [];
    let params: any[] = [];
    let indice = 1;

    if (rol) {
      condiciones.push(`role = $${indice++}`);
      params.push(rol);
    }

    if (activo !== undefined) {
      condiciones.push(`is_active = $${indice++}`);
      params.push(activo);
    }

    const clausulaWhere = condiciones.length > 0 ? 'WHERE ' + condiciones.join(' AND ') : '';

    return this.query<User>(
      `SELECT id, username, email, role, first_name, last_name, phone,
              date_of_birth, address, profile_picture_url, is_active,
              last_login, created_at, updated_at
       FROM users
       ${clausulaWhere}
       ORDER BY created_at DESC`,
      params
    );
  }

  async actualizar(id: string, datos: UpdateUserDTO): Promise<Omit<User, 'password_hash'>> {
    const actualizaciones: string[] = [];
    const params: any[] = [];
    let indice = 1;

    Object.entries(datos).forEach(([clave, valor]) => {
      if (valor !== undefined) {
        actualizaciones.push(`${clave} = $${indice++}`);
        params.push(valor);
      }
    });

    if (actualizaciones.length === 0) {
      throw new Error('No hay campos para actualizar');
    }

    params.push(id);

    const usuario = await this.queryOne<User>(
      `UPDATE users
       SET ${actualizaciones.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${indice}
       RETURNING id, username, email, role, first_name, last_name, phone,
                 date_of_birth, address, profile_picture_url, is_active,
                 last_login, created_at, updated_at`,
      params
    );

    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }

    return usuario;
  }

  async desactivar(id: string): Promise<void> {
    const resultado = await this.execute(
      `UPDATE users
       SET is_active = false, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [id]
    );

    if (resultado === 0) {
      throw new Error('Usuario no encontrado');
    }
  }

  async activar(id: string): Promise<void> {
    const resultado = await this.execute(
      `UPDATE users
       SET is_active = true, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [id]
    );

    if (resultado === 0) {
      throw new Error('Usuario no encontrado');
    }
  }

  async buscar(termino: string): Promise<Omit<User, 'password_hash'>[]> {
    return this.query<User>(
      `SELECT id, username, email, role, first_name, last_name, phone,
              date_of_birth, address, profile_picture_url, is_active,
              last_login, created_at, updated_at
       FROM users
       WHERE first_name ILIKE $1
          OR last_name ILIKE $1
          OR email ILIKE $1
          OR username ILIKE $1
       ORDER BY created_at DESC
       LIMIT 50`,
      [`%${termino}%`]
    );
  }

  async obtenerEstudiantes(): Promise<Omit<User, 'password_hash'>[]> {
    return this.obtenerTodos(UserRole.STUDENT, true);
  }

  async obtenerProfesores(): Promise<Omit<User, 'password_hash'>[]> {
    return this.obtenerTodos(UserRole.TEACHER, true);
  }

  async obtenerPadres(): Promise<Omit<User, 'password_hash'>[]> {
    return this.obtenerTodos(UserRole.PARENT, true);
  }

  async obtenerEstadisticas(): Promise<any> {
    return this.queryOne(
      `SELECT
        COUNT(*) as total_usuarios,
        COUNT(CASE WHEN role = 'student' THEN 1 END) as total_estudiantes,
        COUNT(CASE WHEN role = 'teacher' THEN 1 END) as total_profesores,
        COUNT(CASE WHEN role = 'parent' THEN 1 END) as total_padres,
        COUNT(CASE WHEN role = 'admin' THEN 1 END) as total_admins,
        COUNT(CASE WHEN is_active = true THEN 1 END) as usuarios_activos,
        COUNT(CASE WHEN is_active = false THEN 1 END) as usuarios_inactivos,
        COUNT(CASE WHEN last_login >= CURRENT_TIMESTAMP - INTERVAL '7 days' THEN 1 END) as activos_ultima_semana
       FROM users`
    );
  }

  async actualizarFotoPerfil(id: string, url: string): Promise<void> {
    const resultado = await this.execute(
      `UPDATE users
       SET profile_picture_url = $2, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [id, url]
    );

    if (resultado === 0) {
      throw new Error('Usuario no encontrado');
    }
  }

  async verificarExistencia(email: string, username: string): Promise<boolean> {
    const resultado = await this.queryOne<{ existe: boolean }>(
      'SELECT EXISTS(SELECT 1 FROM users WHERE email = $1 OR username = $2) as existe',
      [email, username]
    );

    return resultado?.existe || false;
  }

  async obtenerPorEmail(email: string): Promise<Omit<User, 'password_hash'> | null> {
    return this.queryOne<User>(
      `SELECT id, username, email, role, first_name, last_name, phone,
              date_of_birth, address, profile_picture_url, is_active,
              last_login, created_at, updated_at
       FROM users
       WHERE email = $1`,
      [email]
    );
  }

  async obtenerPorUsername(username: string): Promise<Omit<User, 'password_hash'> | null> {
    return this.queryOne<User>(
      `SELECT id, username, email, role, first_name, last_name, phone,
              date_of_birth, address, profile_picture_url, is_active,
              last_login, created_at, updated_at
       FROM users
       WHERE username = $1`,
      [username]
    );
  }
}
