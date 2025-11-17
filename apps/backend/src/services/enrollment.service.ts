import { Pool } from 'pg';
import { BaseService } from './base.service';
import { Enrollment, CreateEnrollmentDTO, EnrollmentStatus } from '../models';

export class EnrollmentService extends BaseService {
  constructor(db: Pool) {
    super(db);
  }

  async enroll(userId: string, data: CreateEnrollmentDTO): Promise<Enrollment> {
    const { courseId } = data;

    // Check if already enrolled
    const existing = await this.queryOne<Enrollment>(
      'SELECT id FROM enrollments WHERE user_id = $1 AND course_id = $2',
      [userId, courseId]
    );

    if (existing) {
      throw new Error('Already enrolled in this course');
    }

    // Check course capacity
    const course = await this.queryOne<any>(
      `SELECT max_students,
              (SELECT COUNT(*) FROM enrollments WHERE course_id = $1 AND status = 'active') as enrolled_count
       FROM courses WHERE id = $1`,
      [courseId]
    );

    if (!course) {
      throw new Error('Course not found');
    }

    if (course.max_students && parseInt(course.enrolled_count) >= course.max_students) {
      throw new Error('Course is full');
    }

    // Create enrollment
    const enrollment = await this.queryOne<Enrollment>(
      `INSERT INTO enrollments (user_id, course_id)
       VALUES ($1, $2)
       RETURNING *`,
      [userId, courseId]
    );

    if (!enrollment) {
      throw new Error('Failed to create enrollment');
    }

    return enrollment;
  }

  async unenroll(userId: string, courseId: string): Promise<void> {
    const result = await this.execute(
      `UPDATE enrollments
       SET status = 'dropped', updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $1 AND course_id = $2 AND status = 'active'`,
      [userId, courseId]
    );

    if (result === 0) {
      throw new Error('Enrollment not found or already dropped');
    }
  }

  async getUserEnrollments(userId: string): Promise<any[]> {
    return this.query(
      `SELECT e.*, c.title as course_title, c.code as course_code,
              u.first_name || ' ' || u.last_name as teacher_name
       FROM enrollments e
       INNER JOIN courses c ON e.course_id = c.id
       LEFT JOIN users u ON c.teacher_id = u.id
       WHERE e.user_id = $1
       ORDER BY e.enrolled_at DESC`,
      [userId]
    );
  }

  async getCourseEnrollments(courseId: string): Promise<any[]> {
    return this.query(
      `SELECT e.*, u.first_name || ' ' || u.last_name as student_name, u.email as student_email
       FROM enrollments e
       INNER JOIN users u ON e.user_id = u.id
       WHERE e.course_id = $1
       ORDER BY e.enrolled_at DESC`,
      [courseId]
    );
  }

  async updateProgress(userId: string, courseId: string, progress: number): Promise<Enrollment> {
    const enrollment = await this.queryOne<Enrollment>(
      `UPDATE enrollments
       SET progress = $3, updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $1 AND course_id = $2
       RETURNING *`,
      [userId, courseId, progress]
    );

    if (!enrollment) {
      throw new Error('Enrollment not found');
    }

    return enrollment;
  }

  async updateFinalGrade(userId: string, courseId: string, finalGrade: number): Promise<Enrollment> {
    const enrollment = await this.queryOne<Enrollment>(
      `UPDATE enrollments
       SET final_grade = $3, updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $1 AND course_id = $2
       RETURNING *`,
      [userId, courseId, finalGrade]
    );

    if (!enrollment) {
      throw new Error('Enrollment not found');
    }

    return enrollment;
  }

  async complete(userId: string, courseId: string): Promise<Enrollment> {
    const enrollment = await this.queryOne<Enrollment>(
      `UPDATE enrollments
       SET status = 'completed', updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $1 AND course_id = $2
       RETURNING *`,
      [userId, courseId]
    );

    if (!enrollment) {
      throw new Error('Enrollment not found');
    }

    return enrollment;
  }

  async getEnrollmentStats(courseId: string): Promise<any> {
    return this.queryOne(
      `SELECT
        COUNT(*) as total_enrollments,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_enrollments,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_enrollments,
        COUNT(CASE WHEN status = 'dropped' THEN 1 END) as dropped_enrollments,
        AVG(progress) as avg_progress,
        AVG(final_grade) as avg_grade
       FROM enrollments
       WHERE course_id = $1`,
      [courseId]
    );
  }
}
