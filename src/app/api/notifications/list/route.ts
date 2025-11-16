import { NextRequest, NextResponse } from 'next/server';
import { NotificationService } from '@/lib/NotificationService';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = parseInt(searchParams.get('user_id') || '1'); // TODO: Get from session
    const cursor = searchParams.get('cursor') || undefined;
    const limit = parseInt(searchParams.get('limit') || '25');
    const filter = searchParams.get('filter') as 'unread' | 'archived' | 'all' || 'all';
    const schoolId = searchParams.get('school_id') ? parseInt(searchParams.get('school_id')) : undefined;

    const notificationService = NotificationService.getInstance();
    const result = await notificationService.list(userId, {
      cursor,
      limit,
      filter,
      schoolId
    });

    return NextResponse.json({
      success: true,
      ...result
    });
  } catch (error: any) {
    console.error('Notifications list error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to get notifications'
    }, { status: 500 });
  }
}
