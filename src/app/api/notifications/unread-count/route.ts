import { NextRequest, NextResponse } from 'next/server';
import { NotificationService } from '@/lib/NotificationService';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = parseInt(searchParams.get('user_id') || '1'); // TODO: Get from session
    const schoolId = searchParams.get('school_id') ? parseInt(searchParams.get('school_id')) : undefined;

    const notificationService = NotificationService.getInstance();
    const unread = await notificationService.getUnreadCount(userId, schoolId);

    return NextResponse.json({
      success: true,
      unread
    });
  } catch (error: any) {
    console.error('Unread count error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to get unread count'
    }, { status: 500 });
  }
}
