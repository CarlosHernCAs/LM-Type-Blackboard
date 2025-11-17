import { Pool } from 'pg';
import { BaseService } from './base.service';
import {
  Course,
  CreateCourseDTO,
  UpdateCourseDTO,
  CourseQuery,
  CourseStatus,
  PaginatedResponse,
} from '../models';

export class CourseService extends BaseService {
  constructor(db: Pool) {
    super(db);
  }

  async create(teacherId: string, data: CreateCourseDTO): Promise<Course> {
    const { title, description, code, credits, max_students, start_date, end_date } = data;

    // Check if course code already exists
    const existing = await this.queryOne<Course>(
      'SELECT id FROM courses WHERE code = $1',
      [code]
    );

    if (existing) {
      throw new Error('Course with this code already exists');
    }

    const course = await this.queryOne<Course>(
      `INSERT INTO courses (teacher_id, title, description, code, credits, max_students, start_date, end_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [teacherId, title, description, code, credits, max_students, start_date, end_date]
    );

    if (!course) {
      throw new Error('Failed to create course');
    }

    return course;
  }

  async findById(id: string): Promise<Course | null> {
    return this.queryOne<Course>(
      `SELECT c.*, u.first_name || ' ' || u.last_name as teacher_name,
              (SELECT COUNT(*) FROM enrollments WHERE course_id = c.id AND status = 'active') as enrolled_count
       FROM courses c
       LEFT JOIN users u ON c.teacher_id = u.id
       WHERE c.id = $1`,
      [id]
    );
  }

  async findAll(query: CourseQuery = {}): Promise<PaginatedResponse<Course>> {
    const { page = 1, limit = 20, status, teacher_id, search } = query;
    const offset = (page - 1) * limit;

    let whereConditions: string[] = [];
    let params: any[] = [];
    let paramIndex = 1;

    if (status) {
      whereConditions.push(`c.status = $${paramIndex++}`);
      params.push(status);
    }

    if (teacher_id) {
      whereConditions.push(`c.teacher_id = $${paramIndex++}`);
      params.push(teacher_id);
    }

    if (search) {
      whereConditions.push(`(c.title ILIKE $${paramIndex} OR c.description ILIKE $${paramIndex} OR c.code ILIKE $${paramIndex})`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';

    // Get total count
    const countResult = await this.queryOne<{ count: string }>(
      `SELECT COUNT(*) as count FROM courses c ${whereClause}`,
      params
    );
    const total = parseInt(countResult?.count || '0');

    // Get paginated data
    const courses = await this.query<Course>(
      `SELECT c.*, u.first_name || ' ' || u.last_name as teacher_name,
              (SELECT COUNT(*) FROM enrollments WHERE course_id = c.id AND status = 'active') as enrolled_count
       FROM courses c
       LEFT JOIN users u ON c.teacher_id = u.id
       ${whereClause}
       ORDER BY c.created_at DESC
       LIMIT $${paramIndex++} OFFSET $${paramIndex}`,
      [...params, limit, offset]
    );

    return {
      data: courses,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async update(id: string, data: UpdateCourseDTO): Promise<Course> {
    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    // Build dynamic update query
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        updates.push(`${key} = $${paramIndex++}`);
        params.push(value);
      }
    });

    if (updates.length === 0) {
      throw new Error('No fields to update');
    }

    params.push(id);

    const course = await this.queryOne<Course>(
      `UPDATE courses SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${paramIndex}
       RETURNING *`,
      params
    );

    if (!course) {
      throw new Error('Course not found');
    }

    return course;
  }

  async delete(id: string): Promise<void> {
    const result = await this.execute(
      'DELETE FROM courses WHERE id = $1',
      [id]
    );

    if (result === 0) {
      throw new Error('Course not found');
    }
  }

  async getStudentCourses(studentId: string): Promise<Course[]> {
    return this.query<Course>(
      `SELECT c.*, u.first_name || ' ' || u.last_name as teacher_name,
              e.enrolled_at, e.progress, e.status as enrollment_status
       FROM courses c
       INNER JOIN enrollments e ON c.id = e.course_id
       LEFT JOIN users u ON c.teacher_id = u.id
       WHERE e.user_id = $1 AND e.status = 'active'
       ORDER BY e.enrolled_at DESC`,
      [studentId]
    );
  }

  async getTeacherCourses(teacherId: string): Promise<Course[]> {
    return this.query<Course>(
      `SELECT c.*,
              (SELECT COUNT(*) FROM enrollments WHERE course_id = c.id AND status = 'active') as enrolled_count
       FROM courses c
       WHERE c.teacher_id = $1
       ORDER BY c.created_at DESC`,
      [teacherId]
    );
  }

  async publish(id: string): Promise<Course> {
    return this.update(id, { status: CourseStatus.PUBLISHED });
  }

  async archive(id: string): Promise<Course> {
    return this.update(id, { status: CourseStatus.ARCHIVED });
  }

  async checkEnrollmentCapacity(courseId: string): Promise<boolean> {
    const course = await this.queryOne<any>(
      `SELECT max_students,
              (SELECT COUNT(*) FROM enrollments WHERE course_id = $1 AND status = 'active') as enrolled_count
       FROM courses
       WHERE id = $1`,
      [courseId]
    );

    if (!course) {
      return false;
    }

    if (course.max_students === null) {
      return true; // No limit
    }

    return parseInt(course.enrolled_count) < course.max_students;
  }
}
