import { NextRequest, NextResponse } from 'next/server';
import { initializeFeesSystem } from '@/lib/fees';
import { getServerSession } from 'next-auth';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.role?.includes('admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const school_id = session.user.school_id;
    const result = await initializeFeesSystem(school_id);

    return NextResponse.json({
      success: true,
      message: `Fees system initialized: ${result.newItemsCount} new items created for ${result.studentsCount} students`,
      ...result
    });
  } catch (error: any) {
    console.error('Fees initialization error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to initialize fees system'
    }, { status: 500 });
  }
}
