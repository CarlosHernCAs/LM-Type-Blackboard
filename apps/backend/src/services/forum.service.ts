import { Pool } from 'pg';
import { BaseService } from './base.service';
import { Forum, ForumPost, CreateForumDTO, CreateForumPostDTO } from '../models';

export class ForumService extends BaseService {
  constructor(db: Pool) {
    super(db);
  }

  async crearForo(datos: CreateForumDTO): Promise<Forum> {
    const { course_id, title, description } = datos;

    const foro = await this.queryOne<Forum>(
      `INSERT INTO forums (course_id, title, description)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [course_id, title, description]
    );

    if (!foro) {
      throw new Error('Error al crear el foro');
    }

    return foro;
  }

  async obtenerForoPorId(id: string): Promise<any | null> {
    return this.queryOne(
      `SELECT f.*, c.title as curso_titulo,
              (SELECT COUNT(*) FROM forum_posts WHERE forum_id = f.id) as total_publicaciones
       FROM forums f
       LEFT JOIN courses c ON f.course_id = c.id
       WHERE f.id = $1`,
      [id]
    );
  }

  async obtenerForosPorCurso(cursoId: string): Promise<Forum[]> {
    return this.query<Forum>(
      `SELECT f.*,
              (SELECT COUNT(*) FROM forum_posts WHERE forum_id = f.id) as total_publicaciones
       FROM forums f
       WHERE f.course_id = $1
       ORDER BY f.created_at DESC`,
      [cursoId]
    );
  }

  async actualizarForo(id: string, titulo?: string, descripcion?: string): Promise<Forum> {
    const actualizaciones: string[] = [];
    const params: any[] = [];
    let indice = 1;

    if (titulo) {
      actualizaciones.push(`title = $${indice++}`);
      params.push(titulo);
    }

    if (descripcion !== undefined) {
      actualizaciones.push(`description = $${indice++}`);
      params.push(descripcion);
    }

    if (actualizaciones.length === 0) {
      throw new Error('No hay campos para actualizar');
    }

    params.push(id);

    const foro = await this.queryOne<Forum>(
      `UPDATE forums
       SET ${actualizaciones.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${indice}
       RETURNING *`,
      params
    );

    if (!foro) {
      throw new Error('Foro no encontrado');
    }

    return foro;
  }

  async bloquearForo(id: string): Promise<Forum> {
    const foro = await this.queryOne<Forum>(
      `UPDATE forums
       SET is_locked = true, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    if (!foro) {
      throw new Error('Foro no encontrado');
    }

    return foro;
  }

  async desbloquearForo(id: string): Promise<Forum> {
    const foro = await this.queryOne<Forum>(
      `UPDATE forums
       SET is_locked = false, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    if (!foro) {
      throw new Error('Foro no encontrado');
    }

    return foro;
  }

  async eliminarForo(id: string): Promise<void> {
    const resultado = await this.execute(
      'DELETE FROM forums WHERE id = $1',
      [id]
    );

    if (resultado === 0) {
      throw new Error('Foro no encontrado');
    }
  }

  // Métodos para publicaciones
  async crearPublicacion(usuarioId: string, datos: CreateForumPostDTO): Promise<ForumPost> {
    const { forum_id, parent_post_id, title, content } = datos;

    // Verificar si el foro está bloqueado
    const foro = await this.queryOne<Forum>(
      'SELECT is_locked FROM forums WHERE id = $1',
      [forum_id]
    );

    if (!foro) {
      throw new Error('Foro no encontrado');
    }

    if (foro.is_locked) {
      throw new Error('El foro está bloqueado');
    }

    const publicacion = await this.queryOne<ForumPost>(
      `INSERT INTO forum_posts (forum_id, user_id, parent_post_id, title, content)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [forum_id, usuarioId, parent_post_id, title, content]
    );

    if (!publicacion) {
      throw new Error('Error al crear la publicación');
    }

    return publicacion;
  }

  async obtenerPublicaciones(foroId: string): Promise<any[]> {
    return this.query(
      `SELECT fp.*, u.first_name || ' ' || u.last_name as autor_nombre,
              u.profile_picture_url as autor_foto,
              (SELECT COUNT(*) FROM forum_posts WHERE parent_post_id = fp.id) as total_respuestas
       FROM forum_posts fp
       INNER JOIN users u ON fp.user_id = u.id
       WHERE fp.forum_id = $1 AND fp.parent_post_id IS NULL
       ORDER BY fp.is_pinned DESC, fp.created_at DESC`,
      [foroId]
    );
  }

  async obtenerRespuestas(publicacionId: string): Promise<any[]> {
    return this.query(
      `SELECT fp.*, u.first_name || ' ' || u.last_name as autor_nombre,
              u.profile_picture_url as autor_foto
       FROM forum_posts fp
       INNER JOIN users u ON fp.user_id = u.id
       WHERE fp.parent_post_id = $1
       ORDER BY fp.created_at ASC`,
      [publicacionId]
    );
  }

  async obtenerPublicacionPorId(id: string): Promise<any | null> {
    const publicacion = await this.queryOne(
      `SELECT fp.*, u.first_name || ' ' || u.last_name as autor_nombre,
              u.profile_picture_url as autor_foto,
              (SELECT COUNT(*) FROM forum_posts WHERE parent_post_id = fp.id) as total_respuestas
       FROM forum_posts fp
       INNER JOIN users u ON fp.user_id = u.id
       WHERE fp.id = $1`,
      [id]
    );

    if (publicacion) {
      // Incrementar contador de vistas
      await this.execute(
        'UPDATE forum_posts SET view_count = view_count + 1 WHERE id = $1',
        [id]
      );
    }

    return publicacion;
  }

  async actualizarPublicacion(id: string, usuarioId: string, contenido: string): Promise<ForumPost> {
    const publicacion = await this.queryOne<ForumPost>(
      `UPDATE forum_posts
       SET content = $2, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND user_id = $3
       RETURNING *`,
      [id, contenido, usuarioId]
    );

    if (!publicacion) {
      throw new Error('Publicación no encontrada o no autorizado');
    }

    return publicacion;
  }

  async fijarPublicacion(id: string): Promise<ForumPost> {
    const publicacion = await this.queryOne<ForumPost>(
      `UPDATE forum_posts
       SET is_pinned = true, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    if (!publicacion) {
      throw new Error('Publicación no encontrada');
    }

    return publicacion;
  }

  async desfijarPublicacion(id: string): Promise<ForumPost> {
    const publicacion = await this.queryOne<ForumPost>(
      `UPDATE forum_posts
       SET is_pinned = false, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    if (!publicacion) {
      throw new Error('Publicación no encontrada');
    }

    return publicacion;
  }

  async eliminarPublicacion(id: string, usuarioId: string, esAdmin: boolean = false): Promise<void> {
    let query = 'DELETE FROM forum_posts WHERE id = $1';
    const params = [id];

    if (!esAdmin) {
      query += ' AND user_id = $2';
      params.push(usuarioId);
    }

    const resultado = await this.execute(query, params);

    if (resultado === 0) {
      throw new Error('Publicación no encontrada o no autorizado');
    }
  }

  async buscarPublicaciones(foroId: string, termino: string): Promise<any[]> {
    return this.query(
      `SELECT fp.*, u.first_name || ' ' || u.last_name as autor_nombre,
              u.profile_picture_url as autor_foto,
              (SELECT COUNT(*) FROM forum_posts WHERE parent_post_id = fp.id) as total_respuestas
       FROM forum_posts fp
       INNER JOIN users u ON fp.user_id = u.id
       WHERE fp.forum_id = $1
         AND (fp.title ILIKE $2 OR fp.content ILIKE $2)
       ORDER BY fp.created_at DESC`,
      [foroId, `%${termino}%`]
    );
  }
}
