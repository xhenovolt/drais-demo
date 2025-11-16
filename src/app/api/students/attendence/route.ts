import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0];
  const connection = await getConnection();
  const [rows] = await connection.execute(
    'SELECT * FROM student_attendance_view WHERE date = ? OR date IS NULL',
    [date]
  );
  await connection.end();
  return NextResponse.json({ data: rows });
}

export async function POST(req: NextRequest) {
  try {
    const { studentId, action } = await req.json();
    const timeField = action === 'sign_in' ? 'time_in' : 'time_out';
    const status = action === 'sign_in' ? 'active' : 'inactive';
    const connection = await getConnection();
    const [result]: any = await connection.execute(
      `INSERT INTO student_attendance (student_id, date, ${timeField}, status)
       VALUES (?, CURDATE(), CURTIME(), ?)
       ON DUPLICATE KEY UPDATE ${timeField} = CURTIME(), status = ?`,
      [studentId, status, status]
    );
    await connection.end();
    return NextResponse.json({ success: true, id: result.insertId });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to record attendance' }, { status: 500 });
  }
}