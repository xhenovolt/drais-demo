import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

export async function GET(req: NextRequest) {
  let connection;
  
  try {
    const { searchParams } = new URL(req.url);
    const classId = searchParams.get('class_id');
    const termId = searchParams.get('term_id');
    const academicYearId = searchParams.get('academic_year_id');

    if (!classId || !termId) {
      return NextResponse.json({
        success: false,
        error: 'class_id and term_id are required'
      }, { status: 400 });
    }

    connection = await getConnection();

    // Get current academic year if not provided
    let currentAcademicYear = academicYearId;
    if (!currentAcademicYear) {
      const [yearResult] = await connection.execute(
        'SELECT id FROM academic_years WHERE status = "active" ORDER BY start_date DESC LIMIT 1'
      );
      if (Array.isArray(yearResult) && yearResult.length > 0) {
        currentAcademicYear = (yearResult[0] as any).id;
      }
    }

    // Fetch theology results with student and subject details
    const sql = `
      SELECT 
        r.id,
        r.student_id,
        CONCAT(p.first_name, ' ', p.last_name) as student_name,
        s.admission_no,
        sub.name as subject_name,
        r.score,
        r.grade,
        t.name as term_name,
        c.name as class_name,
        r.created_at,
        r.updated_at
      FROM results r
      JOIN students s ON r.student_id = s.id
      JOIN people p ON s.person_id = p.id
      JOIN subjects sub ON r.subject_id = sub.id
      JOIN terms t ON r.term_id = t.id
      JOIN classes c ON r.theology_class_id = c.id
      WHERE r.theology_class_id = ? 
      AND r.term_id = ? 
      AND r.academic_year_id = ?
      AND r.is_theology = 1
      AND s.deleted_at IS NULL
      ORDER BY p.first_name, p.last_name, sub.name
    `;

    const [rows] = await connection.execute(sql, [classId, termId, currentAcademicYear]);

    return NextResponse.json({
      success: true,
      data: rows,
      total: Array.isArray(rows) ? rows.length : 0
    });

  } catch (error: any) {
    console.error('Error fetching theology results:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch theology results',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });

  } finally {
    if (connection) {
      try {
        await connection.end();
      } catch (closeError) {
        console.error('Error closing connection:', closeError);
      }
    }
  }
}
