import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

export async function GET(req: NextRequest) {
  let connection;
  
  try {
    const { searchParams } = new URL(req.url);
    const schoolId = parseInt(searchParams.get('school_id') || '1');

    connection = await getConnection();

    const [departments] = await connection.execute(`
      SELECT id, name, description
      FROM departments 
      WHERE school_id = ? AND deleted_at IS NULL
      ORDER BY name
    `, [schoolId]);

    return NextResponse.json({
      success: true,
      data: departments
    });

  } catch (error: any) {
    console.error('Departments list error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch departments'
    }, { status: 500 });
  } finally {
    if (connection) await connection.end();
  }
}
