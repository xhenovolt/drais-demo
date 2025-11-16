import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/utils/database';

export async function POST(request: NextRequest) {
  try {
    const { class_id, date, action } = await request.json();

    if (!class_id || !date || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get all active students in the class
    const studentsQuery = `
      SELECT s.id 
      FROM students s
      JOIN enrollments e ON s.id = e.student_id
      WHERE e.class_id = ? 
        AND e.status = 'active'
        AND s.status IN ('active', 'suspended', 'on_leave')
    `;
    const students = await executeQuery(studentsQuery, [class_id]);

    if (students.length === 0) {
      return NextResponse.json({ error: 'No students found in this class' }, { status: 404 });
    }

    const currentTime = new Date().toTimeString().split(' ')[0];
    let successCount = 0;
    let errorCount = 0;

    for (const student of students) {
      try {
        // Check if attendance record exists
        const existingRecord = await executeQuery(
          'SELECT id FROM student_attendance WHERE student_id = ? AND date = ? AND class_id = ?',
          [student.id, date, class_id]
        );

        let query = '';
        let params: any[] = [];

        if (action === 'mark_all_present') {
          if (existingRecord.length > 0) {
            query = `
              UPDATE student_attendance 
              SET status = 'present', time_in = ?, updated_at = NOW()
              WHERE student_id = ? AND date = ? AND class_id = ?
            `;
            params = [currentTime, student.id, date, class_id];
          } else {
            query = `
              INSERT INTO student_attendance (student_id, date, class_id, status, time_in)
              VALUES (?, ?, ?, 'present', ?)
            `;
            params = [student.id, date, class_id, currentTime];
          }
        } else if (action === 'mark_all_absent') {
          if (existingRecord.length > 0) {
            query = `
              UPDATE student_attendance 
              SET status = 'absent', time_in = NULL, time_out = NULL, updated_at = NOW()
              WHERE student_id = ? AND date = ? AND class_id = ?
            `;
            params = [student.id, date, class_id];
          } else {
            query = `
              INSERT INTO student_attendance (student_id, date, class_id, status)
              VALUES (?, ?, ?, 'absent')
            `;
            params = [student.id, date, class_id];
          }
        }

        await executeQuery(query, params);
        successCount++;

      } catch (error) {
        console.error(`Error updating attendance for student ${student.id}:`, error);
        errorCount++;
      }
    }

    // Log bulk action
    const logQuery = `
      INSERT INTO audit_log (action, entity_type, entity_id, changes_json, created_at)
      VALUES (?, 'bulk_attendance', ?, ?, NOW())
    `;
    await executeQuery(logQuery, [
      action,
      class_id,
      JSON.stringify({ 
        class_id, 
        date, 
        action, 
        success_count: successCount,
        error_count: errorCount,
        timestamp: new Date().toISOString() 
      })
    ]);

    return NextResponse.json({
      success: true,
      message: `Bulk attendance update completed`,
      data: {
        total_students: students.length,
        success_count: successCount,
        error_count: errorCount,
        class_id,
        date,
        action
      }
    });

  } catch (error) {
    console.error('Error in bulk attendance operation:', error);
    return NextResponse.json(
      { error: 'Failed to update bulk attendance' },
      { status: 500 }
    );
  }
}
