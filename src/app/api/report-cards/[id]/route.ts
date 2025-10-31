import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db'; // Your DB connection utility

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const reportCardId = params.id;
  const schoolId = req.headers.get('x-school-id'); // Or get from session/auth

  // Optimized query (see above)
  const [row] = await db.query(
    `SELECT
      rc.id AS report_card_id,
      rc.student_id,
      rc.term_id,
      rc.overall_grade,
      rc.class_teacher_comment,
      rc.headteacher_comment,
      rc.dos_comment,
      s.admission_no,
      s.school_id,
      p.first_name,
      p.last_name,
      p.gender,
      p.photo_url,
      t.name AS term_name
    FROM report_cards rc
    JOIN students s ON rc.student_id = s.id
    JOIN people p ON s.person_id = p.id
    JOIN terms t ON rc.term_id = t.id
    WHERE rc.id = ?
      AND s.school_id = ?
    LIMIT 1`,
    [reportCardId, schoolId]
  );

  // Fallback photo
  const photoUrl = row?.photo_url || '/schoollogo.png';

  // ...fetch grades, comments, etc. as needed...

  return NextResponse.json({
    ...row,
    photo_url: photoUrl,
    // ...other fields...
  });
}
