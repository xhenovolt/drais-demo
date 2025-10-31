import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const connection = await getConnection();
    const [results] = await connection.execute(
      `SELECT s.id, s.staff_no, p.first_name, p.last_name, s.position, s.status
       FROM staff s
       JOIN people p ON s.person_id = p.id`
    );
    await connection.end();

    return NextResponse.json({ success: true, data: results });
  } catch (error: any) {
    console.error('Error fetching staff list:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch staff list.', error: error.message }, { status: 500 });
  }
}