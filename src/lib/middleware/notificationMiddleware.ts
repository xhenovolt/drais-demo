import { NextRequest } from 'next/server';
import { NotificationService } from '@/lib/NotificationService';
import { getConnection } from '@/lib/db';

export interface NotificationContext {
  action?: string;
  entity_type?: string;
  entity_id?: number;
  actor_user_id?: number;
  school_id?: number;
  recipients?: number[];
  metadata?: Record<string, any>;
  title?: string;
  message?: string;
}

export class NotificationMiddleware {
  private static notificationService = NotificationService.getInstance();

  /**
   * Auto-log notification from API response
   */
  static async notifyOnAction(
    req: NextRequest,
    context: NotificationContext,
    responseData?: any
  ): Promise<void> {
    try {
      // Skip if no recipients specified
      if (!context.recipients || context.recipients.length === 0) {
        return;
      }

      // Add audit log entry first
      await this.createAuditLog({
        actor_user_id: context.actor_user_id,
        action: context.action || 'unknown_action',
        entity_type: context.entity_type || 'unknown',
        entity_id: context.entity_id,
        changes_json: JSON.stringify({
          ...context.metadata,
          response_data: responseData
        })
      });

      // Try template-based notification first
      if (context.action) {
        await this.notificationService.autoLog(req, context);
      }

      // Fallback to direct notification if title/message provided
      if (context.title && context.message && !context.action) {
        await this.notificationService.create({
          school_id: context.school_id,
          actor_user_id: context.actor_user_id,
          action: 'custom_action',
          entity_type: context.entity_type,
          entity_id: context.entity_id,
          title: context.title,
          message: context.message,
          metadata: context.metadata,
          recipients: context.recipients
        });
      }
    } catch (error) {
      // Log error but don't fail the main request
      console.error('NotificationMiddleware.notifyOnAction error:', error);
    }
  }

  /**
   * Get admin recipients for a school
   */
  static async getAdminRecipients(schoolId: number): Promise<number[]> {
    let connection;
    
    try {
      connection = await getConnection();
      
      const [admins] = await connection.execute(`
        SELECT DISTINCT u.id
        FROM users u
        JOIN roles r ON u.role_id = r.id
        WHERE u.school_id = ? 
          AND u.status = 'active'
          AND (r.name LIKE '%admin%' OR r.name LIKE '%head%')
      `, [schoolId]);

      return Array.isArray(admins) ? admins.map((admin: any) => admin.id) : [];
    } catch (error) {
      console.error('Failed to get admin recipients:', error);
      return [];
    } finally {
      if (connection) await connection.end();
    }
  }

  /**
   * Get teacher recipients for a class
   */
  static async getTeacherRecipients(classId: number): Promise<number[]> {
    let connection;
    
    try {
      connection = await getConnection();
      
      const [teachers] = await connection.execute(`
        SELECT DISTINCT u.id
        FROM users u
        JOIN staff s ON u.id IN (
          SELECT sau.user_id FROM staff_user_accounts sau WHERE sau.staff_id = s.id
        )
        LEFT JOIN classes c ON c.head_teacher_id = s.id
        LEFT JOIN class_subjects cs ON cs.teacher_id = s.id
        WHERE (c.id = ? OR cs.class_id = ?)
          AND u.status = 'active'
          AND s.status = 'active'
      `, [classId, classId]);

      return Array.isArray(teachers) ? teachers.map((teacher: any) => teacher.id) : [];
    } catch (error) {
      console.error('Failed to get teacher recipients:', error);
      return [];
    } finally {
      if (connection) await connection.end();
    }
  }

  private static async createAuditLog(data: {
    actor_user_id?: number;
    action: string;
    entity_type: string;
    entity_id?: number;
    changes_json: string;
  }): Promise<void> {
    let connection;
    
    try {
      connection = await getConnection();
      
      await connection.execute(`
        INSERT INTO audit_log (actor_user_id, action, entity_type, entity_id, changes_json)
        VALUES (?, ?, ?, ?, ?)
      `, [
        data.actor_user_id,
        data.action,
        data.entity_type,
        data.entity_id,
        data.changes_json
      ]);
    } catch (error) {
      console.error('Failed to create audit log:', error);
    } finally {
      if (connection) await connection.end();
    }
  }

  static async createNotification(data: {
    user_id?: number;
    title: string;
    message: string;
    type?: string;
    data?: any;
  }) {
    const connection = await getConnection();
    try {
      const [result] = await connection.execute(
        `INSERT INTO notifications (user_id, title, message, type, data, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          data.user_id || null,
          data.title,
          data.message,
          data.type || 'info',
          data.data ? JSON.stringify(data.data) : null
        ]
      );
      return { success: true, id: (result as any).insertId };
    } catch (error) {
      console.error('Failed to create notification:', error);
      return { success: false, error };
    } finally {
      await connection.end();
    }
  }

  static async markAsRead(notificationId: number, userId?: number) {
    const connection = await getConnection();
    try {
      let query = 'UPDATE notifications SET read_at = NOW() WHERE id = ?';
      let params = [notificationId];
      
      if (userId) {
        query += ' AND user_id = ?';
        params.push(userId);
      }
      
      await connection.execute(query, params);
      return { success: true };
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      return { success: false, error };
    } finally {
      await connection.end();
    }
  }

  static async getUserNotifications(userId: number, limit = 10, offset = 0) {
    const connection = await getConnection();
    try {
      const [rows] = await connection.execute(
        `SELECT * FROM notifications 
         WHERE user_id = ? OR user_id IS NULL 
         ORDER BY created_at DESC 
         LIMIT ? OFFSET ?`,
        [userId, limit, offset]
      );
      return { success: true, data: rows };
    } catch (error) {
      console.error('Failed to get user notifications:', error);
      return { success: false, error };
    } finally {
      await connection.end();
    }
  }

  static async deleteNotification(notificationId: number, userId?: number) {
    const connection = await getConnection();
    try {
      let query = 'DELETE FROM notifications WHERE id = ?';
      let params = [notificationId];
      
      if (userId) {
        query += ' AND user_id = ?';
        params.push(userId);
      }
      
      await connection.execute(query, params);
      return { success: true };
    } catch (error) {
      console.error('Failed to delete notification:', error);
      return { success: false, error };
    } finally {
      await connection.end();
    }
  }
}

export default NotificationMiddleware;
