import { Pool } from 'pg';
import { BaseService } from './base.service';
import { CalendarEvent, CreateCalendarEventDTO, CalendarQuery } from '../models';

export class CalendarService extends BaseService {
  constructor(db: Pool) {
    super(db);
  }

  async create(userId: string, data: CreateCalendarEventDTO): Promise<CalendarEvent> {
    const { courseId, title, description, eventType, startTime, endTime, location, isAllDay } = data;

    const event = await this.queryOne<CalendarEvent>(
      `INSERT INTO calendar_events (course_id, created_by, title, description, event_type, start_time, end_time, location, is_all_day)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [courseId, userId, title, description, eventType, startTime, endTime, location, isAllDay || false]
    );

    if (!event) {
      throw new Error('Failed to create calendar event');
    }

    return event;
  }

  async findById(id: string): Promise<any | null> {
    return this.queryOne(
      `SELECT ce.*,
              c.title as course_title,
              u.first_name || ' ' || u.last_name as creator_name
       FROM calendar_events ce
       LEFT JOIN courses c ON ce.course_id = c.id
       LEFT JOIN users u ON ce.created_by = u.id
       WHERE ce.id = $1`,
      [id]
    );
  }

  async getUserEvents(userId: string, query: CalendarQuery = {}): Promise<CalendarEvent[]> {
    const { start, end, courseId, eventType } = query;

    let whereConditions = ['(ce.created_by = $1 OR ce.course_id IN (SELECT course_id FROM enrollments WHERE user_id = $1))'];
    let params: any[] = [userId];
    let paramIndex = 2;

    if (start && end) {
      whereConditions.push(`ce.start_time >= $${paramIndex++} AND ce.end_time <= $${paramIndex++}`);
      params.push(start, end);
    }

    if (courseId) {
      whereConditions.push(`ce.course_id = $${paramIndex++}`);
      params.push(courseId);
    }

    if (eventType) {
      whereConditions.push(`ce.event_type = $${paramIndex++}`);
      params.push(eventType);
    }

    const whereClause = whereConditions.join(' AND ');

    return this.query<CalendarEvent>(
      `SELECT ce.*,
              c.title as course_title,
              u.first_name || ' ' || u.last_name as creator_name
       FROM calendar_events ce
       LEFT JOIN courses c ON ce.course_id = c.id
       LEFT JOIN users u ON ce.created_by = u.id
       WHERE ${whereClause}
       ORDER BY ce.start_time ASC`,
      params
    );
  }

  async update(id: string, userId: string, data: Partial<CreateCalendarEventDTO>): Promise<CalendarEvent> {
    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    // Map DTO fields to database columns
    const fieldMap: Record<string, string> = {
      courseId: 'course_id',
      eventType: 'event_type',
      startTime: 'start_time',
      endTime: 'end_time',
      isAllDay: 'is_all_day',
    };

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        const dbField = fieldMap[key] || key;
        updates.push(`${dbField} = $${paramIndex++}`);
        params.push(value);
      }
    });

    if (updates.length === 0) {
      throw new Error('No fields to update');
    }

    params.push(id, userId);

    const event = await this.queryOne<CalendarEvent>(
      `UPDATE calendar_events
       SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${paramIndex++} AND created_by = $${paramIndex}
       RETURNING *`,
      params
    );

    if (!event) {
      throw new Error('Event not found or unauthorized');
    }

    return event;
  }

  async delete(id: string, userId: string): Promise<void> {
    const result = await this.execute(
      'DELETE FROM calendar_events WHERE id = $1 AND created_by = $2',
      [id, userId]
    );

    if (result === 0) {
      throw new Error('Event not found or unauthorized');
    }
  }

  async getCourseEvents(courseId: string): Promise<CalendarEvent[]> {
    return this.query<CalendarEvent>(
      `SELECT ce.*,
              u.first_name || ' ' || u.last_name as creator_name
       FROM calendar_events ce
       LEFT JOIN users u ON ce.created_by = u.id
       WHERE ce.course_id = $1
       ORDER BY ce.start_time ASC`,
      [courseId]
    );
  }

  async getUpcomingEvents(userId: string, limit: number = 10): Promise<CalendarEvent[]> {
    return this.query<CalendarEvent>(
      `SELECT ce.*,
              c.title as course_title,
              u.first_name || ' ' || u.last_name as creator_name
       FROM calendar_events ce
       LEFT JOIN courses c ON ce.course_id = c.id
       LEFT JOIN users u ON ce.created_by = u.id
       WHERE (ce.created_by = $1 OR ce.course_id IN (SELECT course_id FROM enrollments WHERE user_id = $1))
         AND ce.start_time >= CURRENT_TIMESTAMP
       ORDER BY ce.start_time ASC
       LIMIT $2`,
      [userId, limit]
    );
  }
}
