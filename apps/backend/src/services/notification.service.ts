import { Pool } from 'pg';
import { BaseService } from './base.service';
import { Notification, NotificationType } from '../models';

export class NotificationService extends BaseService {
  constructor(db: Pool) {
    super(db);
  }

  async create(
    userId: string,
    type: NotificationType,
    title: string,
    content: string,
    relatedId?: string
  ): Promise<Notification> {
    const notification = await this.queryOne<Notification>(
      `INSERT INTO notifications (user_id, type, title, content, related_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [userId, type, title, content, relatedId]
    );

    if (!notification) {
      throw new Error('Failed to create notification');
    }

    return notification;
  }

  async getUserNotifications(userId: string, limit: number = 50): Promise<Notification[]> {
    return this.query<Notification>(
      `SELECT * FROM notifications
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2`,
      [userId, limit]
    );
  }

  async getUnreadNotifications(userId: string): Promise<Notification[]> {
    return this.query<Notification>(
      `SELECT * FROM notifications
       WHERE user_id = $1 AND is_read = false
       ORDER BY created_at DESC`,
      [userId]
    );
  }

  async getUnreadCount(userId: string): Promise<number> {
    const result = await this.queryOne<{ count: string }>(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND is_read = false',
      [userId]
    );

    return parseInt(result?.count || '0');
  }

  async markAsRead(id: string, userId: string): Promise<void> {
    await this.execute(
      `UPDATE notifications
       SET is_read = true
       WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.execute(
      `UPDATE notifications
       SET is_read = true
       WHERE user_id = $1 AND is_read = false`,
      [userId]
    );
  }

  async delete(id: string, userId: string): Promise<void> {
    const result = await this.execute(
      'DELETE FROM notifications WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (result === 0) {
      throw new Error('Notification not found or unauthorized');
    }
  }

  async deleteAll(userId: string): Promise<void> {
    await this.execute(
      'DELETE FROM notifications WHERE user_id = $1',
      [userId]
    );
  }

  // Helper methods to create specific notification types
  async notifyNewAssignment(userId: string, assignmentTitle: string, assignmentId: string): Promise<Notification> {
    return this.create(
      userId,
      NotificationType.ASSIGNMENT,
      'Nueva tarea asignada',
      `Se ha publicado una nueva tarea: ${assignmentTitle}`,
      assignmentId
    );
  }

  async notifyNewGrade(userId: string, assignmentTitle: string, gradeId: string): Promise<Notification> {
    return this.create(
      userId,
      NotificationType.GRADE,
      'Nueva calificación disponible',
      `Tu tarea "${assignmentTitle}" ha sido calificada`,
      gradeId
    );
  }

  async notifyNewMessage(userId: string, senderName: string, messageId: string): Promise<Notification> {
    return this.create(
      userId,
      NotificationType.MESSAGE,
      'Nuevo mensaje',
      `${senderName} te ha enviado un mensaje`,
      messageId
    );
  }

  async notifyAnnouncement(userId: string, title: string, announcementId: string): Promise<Notification> {
    return this.create(
      userId,
      NotificationType.ANNOUNCEMENT,
      title,
      'Nuevo anuncio disponible',
      announcementId
    );
  }

  async notifyForumReply(userId: string, postTitle: string, replyId: string): Promise<Notification> {
    return this.create(
      userId,
      NotificationType.FORUM,
      'Nueva respuesta en foro',
      `Alguien respondió a tu publicación: ${postTitle}`,
      replyId
    );
  }
}
