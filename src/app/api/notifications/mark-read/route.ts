import { NextRequest, NextResponse } from 'next/server';
import { NotificationService } from '@/lib/NotificationService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { ids, user_id = 1 } = body; // TODO: Get user_id from session

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Invalid notification IDs'
      }, { status: 400 });
    }

    const notificationService = NotificationService.getInstance();
    await notificationService.markAsRead(ids, user_id);

    return NextResponse.json({
      success: true,
      message: 'Notifications marked as read'
    });
  } catch (error: any) {
    console.error('Mark read error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to mark notifications as read'
    }, { status: 500 });
  }
}
