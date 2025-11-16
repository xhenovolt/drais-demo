import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

export async function POST(req: NextRequest) {
  const { student_id, class_id, date } = await req.json();
  const today = date || new Date().toISOString().split('T')[0];
  const connection = await getConnection();
  await connection.execute(
    `INSERT INTO student_attendance (student_id, class_id, date, status, time_in)
     VALUES (?, ?, ?, 'active', CURTIME())
     ON DUPLICATE KEY UPDATE status='active', time_in=IFNULL(time_in, CURTIME())`,
    [student_id, class_id, today]
  );
  await connection.end();
  return NextResponse.json({ success: true });
}
