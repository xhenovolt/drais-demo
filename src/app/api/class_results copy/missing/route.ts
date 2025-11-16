import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const classId = searchParams.get('class_id');
  const termId = searchParams.get('term_id');
  const subjectId = searchParams.get('subject_id');
  const resultTypeId = searchParams.get('result_type_id');

  if (!classId || !subjectId || !resultTypeId) {
    return NextResponse.json({ success: false, error: 'Missing required parameters.' }, { status: 400 });
  }

  const connection = await getConnection();

  // Check if class_results table has any data
  const [resultsCountRows]: any = await connection.execute('SELECT COUNT(*) AS total FROM class_results');
  const resultsCount = resultsCountRows[0]?.total || 0;

  let students: any[] = [];

  if (resultsCount === 0) {
    // No results at all: fetch all students in the class (and optionally term), order by name
    const [rows]: any = await connection.execute(
      `SELECT e.*, s.id as student_id, p.first_name, p.last_name
       FROM enrollments e
       JOIN students s ON s.id = e.student_id
       JOIN people p ON p.id = s.person_id
       WHERE e.class_id = ? AND e.status = 'active'${termId ? ' AND e.term_id = ?' : ''}
       ORDER BY p.last_name ASC, p.first_name ASC`,
      termId ? [classId, termId] : [classId]
    );
    students = rows;
  } else {
    // Results exist: fetch students in class/term who do NOT have a result for the selected subject and type (and term if provided)
    const [rows]: any = await connection.execute(
      `SELECT e.*, s.id as student_id, p.first_name, p.last_name
       FROM enrollments e
       JOIN students s ON s.id = e.student_id
       JOIN people p ON p.id = s.person_id
       LEFT JOIN class_results r
         ON r.student_id = s.id
         AND r.class_id = e.class_id
         AND r.subject_id = ?
         AND r.result_type_id = ?
         ${termId ? 'AND r.term_id = ?' : ''}
       WHERE e.class_id = ? AND e.status = 'active'
         ${termId ? 'AND e.term_id = ?' : ''}
         AND r.student_id IS NULL
       ORDER BY p.last_name ASC, p.first_name ASC`,
      termId
        ? [subjectId, resultTypeId, termId, classId, termId]
        : [subjectId, resultTypeId, classId]
    );
    students = rows;
  }

  await connection.end();

  return NextResponse.json({ success: true, data: students });
}
