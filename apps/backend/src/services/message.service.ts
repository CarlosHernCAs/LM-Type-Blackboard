import { Pool } from 'pg';
import { BaseService } from './base.service';
import { Message, CreateMessageDTO } from '../models';

export class MessageService extends BaseService {
  constructor(db: Pool) {
    super(db);
  }

  async send(senderId: string, data: CreateMessageDTO): Promise<Message> {
    const { recipientId, subject, content } = data;

    const message = await this.queryOne<Message>(
      `INSERT INTO messages (sender_id, recipient_id, subject, content)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [senderId, recipientId, subject, content]
    );

    if (!message) {
      throw new Error('Failed to send message');
    }

    return message;
  }

  async getInbox(userId: string): Promise<any[]> {
    return this.query(
      `SELECT m.*,
              u.first_name || ' ' || u.last_name as sender_name,
              u.profile_picture_url as sender_picture
       FROM messages m
       INNER JOIN users u ON m.sender_id = u.id
       WHERE m.recipient_id = $1
       ORDER BY m.created_at DESC`,
      [userId]
    );
  }

  async getSent(userId: string): Promise<any[]> {
    return this.query(
      `SELECT m.*,
              u.first_name || ' ' || u.last_name as recipient_name,
              u.profile_picture_url as recipient_picture
       FROM messages m
       INNER JOIN users u ON m.recipient_id = u.id
       WHERE m.sender_id = $1
       ORDER BY m.created_at DESC`,
      [userId]
    );
  }

  async getConversations(userId: string): Promise<any[]> {
    return this.query(
      `SELECT DISTINCT ON (other_user_id)
        other_user_id,
        other_user_name,
        other_user_picture,
        last_message,
        last_message_time,
        unread_count
      FROM (
        SELECT
          CASE
            WHEN sender_id = $1 THEN recipient_id
            ELSE sender_id
          END as other_user_id,
          CASE
            WHEN sender_id = $1 THEN (SELECT first_name || ' ' || last_name FROM users WHERE id = recipient_id)
            ELSE (SELECT first_name || ' ' || last_name FROM users WHERE id = sender_id)
          END as other_user_name,
          CASE
            WHEN sender_id = $1 THEN (SELECT profile_picture_url FROM users WHERE id = recipient_id)
            ELSE (SELECT profile_picture_url FROM users WHERE id = sender_id)
          END as other_user_picture,
          content as last_message,
          created_at as last_message_time,
          (SELECT COUNT(*) FROM messages WHERE recipient_id = $1 AND sender_id = other_user_id AND is_read = false) as unread_count
        FROM messages
        WHERE sender_id = $1 OR recipient_id = $1
        ORDER BY created_at DESC
      ) conversations
      ORDER BY other_user_id, last_message_time DESC`,
      [userId]
    );
  }

  async getConversationWith(userId: string, otherUserId: string): Promise<Message[]> {
    return this.query<Message>(
      `SELECT m.*,
              sender.first_name || ' ' || sender.last_name as sender_name,
              sender.profile_picture_url as sender_picture
       FROM messages m
       INNER JOIN users sender ON m.sender_id = sender.id
       WHERE (m.sender_id = $1 AND m.recipient_id = $2)
          OR (m.sender_id = $2 AND m.recipient_id = $1)
       ORDER BY m.created_at ASC`,
      [userId, otherUserId]
    );
  }

  async markAsRead(messageId: string, userId: string): Promise<void> {
    await this.execute(
      `UPDATE messages
       SET is_read = true, read_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND recipient_id = $2`,
      [messageId, userId]
    );
  }

  async markConversationAsRead(userId: string, otherUserId: string): Promise<void> {
    await this.execute(
      `UPDATE messages
       SET is_read = true, read_at = CURRENT_TIMESTAMP
       WHERE recipient_id = $1 AND sender_id = $2 AND is_read = false`,
      [userId, otherUserId]
    );
  }

  async delete(messageId: string, userId: string): Promise<void> {
    const result = await this.execute(
      'DELETE FROM messages WHERE id = $1 AND (sender_id = $2 OR recipient_id = $2)',
      [messageId, userId]
    );

    if (result === 0) {
      throw new Error('Message not found or unauthorized');
    }
  }

  async getUnreadCount(userId: string): Promise<number> {
    const result = await this.queryOne<{ count: string }>(
      'SELECT COUNT(*) as count FROM messages WHERE recipient_id = $1 AND is_read = false',
      [userId]
    );

    return parseInt(result?.count || '0');
  }
}
