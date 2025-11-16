import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const classId = searchParams.get('class_id');
  const streamId = searchParams.get('stream_id');
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

  const connection = await getConnection();
  const params: any[] = [date];
  let where = 'WHERE e.status = "active"';
  if (classId) {
    where += ' AND e.class_id = ?';
    params.push(classId);
  }
  if (streamId) {
    where += ' AND e.stream_id = ?';
    params.push(streamId);
  }

  // Only filter by class/stream if provided, otherwise show all students
  const [rows] = await connection.execute(
    `
    SELECT
      s.id as student_id,
      s.admission_no,
      p.first_name,
      p.last_name,
      p.photo_url,
      e.class_id,
      e.stream_id,
      a.id as attendance_id,
      a.status as attendance_status,
      a.time_in,
      a.time_out
    FROM students s
    JOIN people p ON p.id = s.person_id
    LEFT JOIN enrollments e ON e.student_id = s.id AND e.status = 'active'
    LEFT JOIN student_attendance a
      ON a.student_id = s.id AND a.date = ?
    ${classId || streamId ? where : ''}
    ORDER BY p.last_name, p.first_name
    `,
    params
  );
  await connection.end();
  return NextResponse.json({ data: rows });
}
