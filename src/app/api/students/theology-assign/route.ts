import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

export async function POST(req: NextRequest) {
  let connection;
  
  try {
    const body = await req.json();
    const { student_ids, theology_class_id, academic_year_id, term_id } = body;

    // Validation
    if (!student_ids || !Array.isArray(student_ids) || student_ids.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Student IDs are required and must be a non-empty array'
      }, { status: 400 });
    }

    if (!theology_class_id) {
      return NextResponse.json({
        success: false,
        error: 'Theology class ID is required'
      }, { status: 400 });
    }

    connection = await getConnection();
    await connection.beginTransaction();

    try {
      // Verify theology class exists
      const [classCheck] = await connection.execute(
        'SELECT id, name FROM classes WHERE id = ?',
        [theology_class_id]
      );

      if (!Array.isArray(classCheck) || classCheck.length === 0) {
        throw new Error('Theology class not found');
      }

      // Verify all students exist
      const studentPlaceholders = student_ids.map(() => '?').join(',');
      const [studentCheck] = await connection.execute(
        `SELECT id FROM students WHERE id IN (${studentPlaceholders}) AND deleted_at IS NULL`,
        student_ids
      );

      if (!Array.isArray(studentCheck) || studentCheck.length !== student_ids.length) {
        throw new Error('One or more students not found or are deleted');
      }

      // Get current academic year and term if not provided
      let currentAcademicYear = academic_year_id;
      let currentTerm = term_id;

      // if (!currentAcademicYear) {
      //   const [yearResult] = await connection.execute(
      //     'SELECT id FROM academic_years WHERE status = "active" ORDER BY start_date DESC LIMIT 1'
      //   );
      //   if (Array.isArray(yearResult) && yearResult.length > 0) {
      //     currentAcademicYear = (yearResult[0] as any).id;
      //   }
      // }

      if (!currentTerm) {
        const [termResult] = await connection.execute(
          'SELECT id FROM terms WHERE status = "active" ORDER BY start_date DESC LIMIT 1'
        );
        if (Array.isArray(termResult) && termResult.length > 0) {
          currentTerm = (termResult[0] as any).id;
        }
      }

      let updatedCount = 0;
      let createdCount = 0;

      // Process each student
      for (const studentId of student_ids) {
        // Check if enrollment exists for this student
        const [existingEnrollment] = await connection.execute(
          'SELECT id FROM enrollments WHERE student_id = ?',
          [studentId]
        );

        if (Array.isArray(existingEnrollment) && existingEnrollment.length > 0) {
          // Update existing enrollment
          await connection.execute(
            'UPDATE enrollments SET theology_class_id = ? WHERE student_id = ?',
            [theology_class_id, studentId]
          );
          updatedCount++;
        } else {
          // Create new enrollment with theology class
          await connection.execute(
            'INSERT INTO enrollments (student_id, theology_class_id, academic_year_id, term_id, status) VALUES (?, ?, ?, ?, ?)',
            [studentId, theology_class_id, 'active']
          );
          createdCount++;
        }
      }

      await connection.commit();

      return NextResponse.json({
        success: true,
        message: `Successfully assigned ${student_ids.length} students to theology class`,
        data: {
          updated_enrollments: updatedCount,
          created_enrollments: createdCount,
          theology_class_name: (classCheck[0] as any).name
        }
      });

    } catch (error) {
      await connection.rollback();
      throw error;
    }

  } catch (error: any) {
    console.error('Error in theology class assignment:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to assign theology class'
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
