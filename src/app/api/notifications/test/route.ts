import { NextRequest, NextResponse } from 'next/server';
import { NotificationService } from '@/lib/NotificationService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { template_code, recipients, variables = {}, school_id = 1 } = body;

    if (!template_code || !Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Template code and recipients are required'
      }, { status: 400 });
    }

    const notificationService = NotificationService.getInstance();
    const result = await notificationService.createFromTemplate(
      template_code,
      variables,
      recipients,
      { school_id }
    );

    return NextResponse.json({
      success: true,
      message: 'Test notification sent',
      ...result
    });
  } catch (error: any) {
    console.error('Test notification error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to send test notification'
    }, { status: 500 });
  }
}
