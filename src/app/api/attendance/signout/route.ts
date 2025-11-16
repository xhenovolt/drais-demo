import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

export async function POST(req: NextRequest) {
  const { student_id, class_id, date } = await req.json();
  const today = date || new Date().toISOString().split('T')[0];
  const connection = await getConnection();
  await connection.execute(
    `UPDATE student_attendance SET status='inactive', time_out=CURTIME()
     WHERE student_id=? AND class_id=? AND date=?`,
    [student_id, class_id, today]
  );
  await connection.end();
  return NextResponse.json({ success: true });
}
