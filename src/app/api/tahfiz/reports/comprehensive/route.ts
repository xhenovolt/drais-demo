import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

/**
 * GET /api/tahfiz/reports/comprehensive
 * Fetch comprehensive Tahfiz reports using REAL class_results data
 * This replaces static/manual data with actual database records
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const schoolId = searchParams.get('school_id') || '1';
  const termId = searchParams.get('term_id');
  const classId = searchParams.get('class_id');
  const groupId = searchParams.get('group_id');
  const studentId = searchParams.get('student_id');

  let connection: any;
  try {
    connection = await getConnection();

    // Fetch students with their REAL Tahfiz results from class_results
    let sql = `
      SELECT 
        s.id as student_id,
        s.admission_no,
        p.first_name,
        p.last_name,
        p.gender,
        p.photo_url,
        c.id as class_id,
        c.name as class_name,
        st.name as stream_name,
        tg.id as group_id,
        tg.name as group_name,
        CONCAT(tp.first_name, ' ', tp.last_name) as teacher_name,
        t.id as term_id,
        t.name as term_name,
        ay.year as academic_year,
        
        -- REAL aggregated scores from class_results
        COUNT(DISTINCT cr.id) as total_records,
        AVG(CASE WHEN subj.code LIKE '%TAHFIZ%' OR subj.subject_type = 'tahfiz' 
            THEN cr.score END) as avg_tahfiz_score,
        AVG(CASE WHEN subj.code LIKE '%RETENTION%' 
            THEN cr.score END) as avg_retention_score,
        AVG(CASE WHEN subj.code LIKE '%TAJWEED%' 
            THEN cr.score END) as avg_tajweed_score,
        AVG(CASE WHEN subj.code LIKE '%RECITATION%' OR subj.code LIKE '%VOICE%'
            THEN cr.score END) as avg_voice_score,
        SUM(CASE WHEN cr.grade IN ('A', 'B', 'C', 'D') THEN 1 ELSE 0 END) as completed_portions,
        
        -- Attendance data
        COUNT(DISTINCT ta.id) as total_attendance_records,
        SUM(CASE WHEN ta.status = 'present' THEN 1 ELSE 0 END) as present_days,
        
        -- Portion progress
        COUNT(DISTINCT tp_assigned.id) as total_portions_assigned,
        SUM(CASE WHEN tp_assigned.status = 'completed' THEN 1 ELSE 0 END) as portions_completed,
        SUM(CASE WHEN tp_assigned.status = 'in_progress' THEN 1 ELSE 0 END) as portions_in_progress
        
      FROM students s
      INNER JOIN people p ON s.person_id = p.id
      LEFT JOIN classes c ON s.class_id = c.id
      LEFT JOIN streams st ON s.stream_id = st.id
      LEFT JOIN tahfiz_groups tg ON s.id = ANY(
        SELECT JSON_EXTRACT(tg2.students, '$[*]') FROM tahfiz_groups tg2 WHERE tg2.id = tg.id
      )
      LEFT JOIN tahfiz_groups tg_teacher ON tg.teacher_id = tg_teacher.teacher_id
      LEFT JOIN people tp ON tg.teacher_id = tp.id
      
      -- JOIN with REAL class_results for Tahfiz subjects
      LEFT JOIN class_results cr ON s.id = cr.student_id
      LEFT JOIN subjects subj ON cr.subject_id = subj.id AND (subj.subject_type = 'tahfiz' OR subj.code LIKE '%TAHFIZ%')
      LEFT JOIN terms t ON cr.term_id = t.id
      LEFT JOIN academic_years ay ON t.academic_year_id = ay.id
      
      -- Attendance records
      LEFT JOIN tahfiz_attendance ta ON s.id = ta.student_id
      
      -- Portion assignments
      LEFT JOIN tahfiz_portions tp_assigned ON s.id = tp_assigned.student_id
      
      WHERE s.school_id = ?
        AND s.deleted_at IS NULL
        ${termId ? 'AND cr.term_id = ?' : ''}
        ${classId ? 'AND s.class_id = ?' : ''}
        ${groupId ? 'AND tg.id = ?' : ''}
        ${studentId ? 'AND s.id = ?' : ''}
      
      GROUP BY s.id, s.admission_no, p.first_name, p.last_name, p.gender, p.photo_url,
               c.id, c.name, st.name, tg.id, tg.name, tp.first_name, tp.last_name,
               t.id, t.name, ay.year
      
      ORDER BY c.name, p.last_name, p.first_name
    `;

    const params: any[] = [schoolId];
    if (termId) params.push(termId);
    if (classId) params.push(classId);
    if (groupId) params.push(groupId);
    if (studentId) params.push(studentId);

    const [students] = await connection.execute(sql, params);

    // Fetch detailed results for each student
    const studentsWithDetails = await Promise.all(
      (students as any[]).map(async (student) => {
        // Get individual subject results
        const [results] = await connection.execute(
          `SELECT 
            subj.id as subject_id,
            subj.name as subject_name,
            subj.code as subject_code,
            cr.score,
            cr.grade,
            cr.remarks,
            CONCAT(teacher_p.first_name, ' ', teacher_p.last_name) as teacher_name,
            t.name as term_name
          FROM class_results cr
          INNER JOIN subjects subj ON cr.subject_id = subj.id
          INNER JOIN terms t ON cr.term_id = t.id
          LEFT JOIN staff teacher_staff ON subj.teacher_id = teacher_staff.id
          LEFT JOIN people teacher_p ON teacher_staff.person_id = teacher_p.id
          WHERE cr.student_id = ?
            AND (subj.subject_type = 'tahfiz' OR subj.code LIKE '%TAHFIZ%' OR subj.code LIKE '%QURAN%')
            ${termId ? 'AND cr.term_id = ?' : ''}
          ORDER BY subj.name`,
          termId ? [student.student_id, termId] : [student.student_id]
        );

        // Get evaluation records
        const [evaluations] = await connection.execute(
          `SELECT * FROM tahfiz_evaluations WHERE student_id = ? ORDER BY created_at DESC LIMIT 5`,
          [student.student_id]
        );

        // Get portion details
        const [portions] = await connection.execute(
          `SELECT 
            tp.*,
            tb.name as book_name,
            tb.total_pages
          FROM tahfiz_portions tp
          LEFT JOIN tahfiz_books tb ON tp.book_id = tb.id
          WHERE tp.student_id = ?
          ORDER BY tp.created_at DESC`,
          [student.student_id]
        );

        // Get attendance details
        const [attendance] = await connection.execute(
          `SELECT * FROM tahfiz_attendance 
          WHERE student_id = ?
          ORDER BY date DESC LIMIT 30`,
          [student.student_id]
        );

        return {
          ...student,
          results,
          evaluations,
          portions,
          attendance,
          // Calculate overall performance metrics
          avg_marks: student.avg_tahfiz_score || 0,
          eval_retention_score: student.avg_retention_score || 0,
          eval_tajweed_score: student.avg_tajweed_score || 0,
          eval_voice_score: student.avg_voice_score || 0,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: studentsWithDetails,
      count: studentsWithDetails.length,
    });
  } catch (error: any) {
    console.error('Error fetching comprehensive Tahfiz reports:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  } finally {
    if (connection) await connection.end();
  }
}
