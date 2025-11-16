import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

export async function GET(req: NextRequest) {
  let connection;
  
  try {
    const { searchParams } = new URL(req.url);
    const schoolId = parseInt(searchParams.get('school_id') || '1');

    connection = await getConnection();

    const [roles] = await connection.execute(`
      SELECT id, name, description
      FROM roles 
      WHERE school_id = ? OR school_id IS NULL
      ORDER BY name
    `, [schoolId]);

    return NextResponse.json({
      success: true,
      data: roles
    });

  } catch (error: any) {
    console.error('Roles list error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch roles'
    }, { status: 500 });
  } finally {
    if (connection) await connection.end();
  }
}
