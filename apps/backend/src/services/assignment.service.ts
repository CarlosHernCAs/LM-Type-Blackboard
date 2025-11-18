import { Pool } from 'pg';
import { BaseService } from './base.service';
import { Assignment, CreateAssignmentDTO, UpdateAssignmentDTO, AssignmentQuery, Submission, CreateSubmissionDTO } from '../models';

export class AssignmentService extends BaseService {
  constructor(db: Pool) {
    super(db);
  }

  async crear(datos: CreateAssignmentDTO): Promise<Assignment> {
    const { course_id, title, description, type, max_score, due_date } = datos;

    const tarea = await this.queryOne<Assignment>(
      `INSERT INTO assignments (course_id, title, description, type, max_score, due_date)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [course_id, title, description, type, max_score, due_date]
    );

    if (!tarea) {
      throw new Error('Error al crear la tarea');
    }

    return tarea;
  }

  async obtenerPorId(id: string): Promise<any | null> {
    return this.queryOne(
      `SELECT a.*, c.title as curso_titulo,
              (SELECT COUNT(*) FROM submissions WHERE assignment_id = a.id) as total_entregas
       FROM assignments a
       LEFT JOIN courses c ON a.course_id = c.id
       WHERE a.id = $1`,
      [id]
    );
  }

  async obtenerTodos(query: AssignmentQuery = {}): Promise<Assignment[]> {
    const { course_id, type, is_published } = query;

    let condiciones: string[] = [];
    let params: any[] = [];
    let indice = 1;

    if (course_id) {
      condiciones.push(`a.course_id = $${indice++}`);
      params.push(course_id);
    }

    if (type) {
      condiciones.push(`a.type = $${indice++}`);
      params.push(type);
    }

    if (is_published !== undefined) {
      condiciones.push(`a.is_published = $${indice++}`);
      params.push(is_published);
    }

    const clausulaWhere = condiciones.length > 0 ? 'WHERE ' + condiciones.join(' AND ') : '';

    return this.query<Assignment>(
      `SELECT a.*, c.title as curso_titulo,
              (SELECT COUNT(*) FROM submissions WHERE assignment_id = a.id) as total_entregas
       FROM assignments a
       LEFT JOIN courses c ON a.course_id = c.id
       ${clausulaWhere}
       ORDER BY a.due_date ASC NULLS LAST, a.created_at DESC`,
      params
    );
  }

  async actualizar(id: string, datos: UpdateAssignmentDTO): Promise<Assignment> {
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

    const tarea = await this.queryOne<Assignment>(
      `UPDATE assignments
       SET ${actualizaciones.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${indice}
       RETURNING *`,
      params
    );

    if (!tarea) {
      throw new Error('Tarea no encontrada');
    }

    return tarea;
  }

  async eliminar(id: string): Promise<void> {
    const resultado = await this.execute(
      'DELETE FROM assignments WHERE id = $1',
      [id]
    );

    if (resultado === 0) {
      throw new Error('Tarea no encontrada');
    }
  }

  async publicar(id: string): Promise<Assignment> {
    return this.actualizar(id, { is_published: true });
  }

  async obtenerPorCurso(cursoId: string): Promise<Assignment[]> {
    return this.query<Assignment>(
      `SELECT a.*,
              (SELECT COUNT(*) FROM submissions WHERE assignment_id = a.id) as total_entregas
       FROM assignments a
       WHERE a.course_id = $1
       ORDER BY a.due_date ASC NULLS LAST`,
      [cursoId]
    );
  }

  async obtenerProximas(estudianteId: string, limite: number = 10): Promise<any[]> {
    return this.query(
      `SELECT a.*, c.title as curso_titulo,
              s.submitted_at, s.score
       FROM assignments a
       INNER JOIN courses c ON a.course_id = c.id
       INNER JOIN enrollments e ON c.id = e.course_id
       LEFT JOIN submissions s ON a.id = s.assignment_id AND s.student_id = $1
       WHERE e.user_id = $1
         AND a.is_published = true
         AND (a.due_date >= CURRENT_TIMESTAMP OR a.due_date IS NULL)
       ORDER BY a.due_date ASC NULLS LAST
       LIMIT $2`,
      [estudianteId, limite]
    );
  }

  // Métodos para submissions
  async crearEntrega(estudianteId: string, datos: CreateSubmissionDTO): Promise<Submission> {
    const { assignment_id, content, file_url } = datos;

    // Verificar si ya existe una entrega
    const existente = await this.queryOne<Submission>(
      'SELECT id FROM submissions WHERE assignment_id = $1 AND student_id = $2',
      [assignment_id, estudianteId]
    );

    if (existente) {
      throw new Error('Ya existe una entrega para esta tarea');
    }

    const entrega = await this.queryOne<Submission>(
      `INSERT INTO submissions (assignment_id, student_id, content, file_url, submitted_at)
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
       RETURNING *`,
      [assignment_id, estudianteId, content, file_url]
    );

    if (!entrega) {
      throw new Error('Error al crear la entrega');
    }

    return entrega;
  }

  async obtenerEntregas(tareaId: string): Promise<any[]> {
    return this.query(
      `SELECT s.*, u.first_name || ' ' || u.last_name as estudiante_nombre, u.email as estudiante_email
       FROM submissions s
       INNER JOIN users u ON s.student_id = u.id
       WHERE s.assignment_id = $1
       ORDER BY s.submitted_at DESC`,
      [tareaId]
    );
  }

  async calificar(entregaId: string, profesorId: string, puntaje: number, feedback?: string): Promise<Submission> {
    const entrega = await this.queryOne<Submission>(
      `UPDATE submissions
       SET score = $2, feedback = $3, graded_at = CURRENT_TIMESTAMP, graded_by = $4
       WHERE id = $1
       RETURNING *`,
      [entregaId, puntaje, feedback, profesorId]
    );

    if (!entrega) {
      throw new Error('Entrega no encontrada');
    }

    return entrega;
  }

  async obtenerEstadisticas(tareaId: string): Promise<any> {
    return this.queryOne(
      `SELECT
        COUNT(*) as total_entregas,
        COUNT(CASE WHEN score IS NOT NULL THEN 1 END) as entregas_calificadas,
        COUNT(CASE WHEN score IS NULL THEN 1 END) as entregas_pendientes,
        AVG(score) as promedio_puntaje,
        MAX(score) as puntaje_maximo,
        MIN(score) as puntaje_minimo
       FROM submissions
       WHERE assignment_id = $1`,
      [tareaId]
    );
  }
}
