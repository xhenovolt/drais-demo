import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

export async function POST(req: NextRequest) {
  let connection;
  
  try {
    const body = await req.json();
    const { 
      student_id, 
      subject_id, 
      score, 
      theology_class_id, 
      term_id, 
      academic_year_id,
      is_theology = true 
    } = body;

    // Validation
    if (!student_id || !subject_id || score === undefined || !theology_class_id || !term_id) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: student_id, subject_id, score, theology_class_id, term_id'
      }, { status: 400 });
    }

    const numericScore = parseFloat(score);
    if (isNaN(numericScore) || numericScore < 0 || numericScore > 100) {
      return NextResponse.json({
        success: false,
        error: 'Score must be a number between 0 and 100'
      }, { status: 400 });
    }

    connection = await getConnection();
    await connection.beginTransaction();

    try {
      // Get current academic year if not provided
      let currentAcademicYear = academic_year_id;
      if (!currentAcademicYear) {
        const [yearResult] = await connection.execute(
          'SELECT id FROM academic_years WHERE status = "active" ORDER BY start_date DESC LIMIT 1'
        );
        if (Array.isArray(yearResult) && yearResult.length > 0) {
          currentAcademicYear = (yearResult[0] as any).id;
        }
      }

      // Verify student exists and is enrolled in theology class
      const [studentCheck] = await connection.execute(
        `SELECT s.id, p.first_name, p.last_name 
         FROM students s 
         JOIN people p ON s.person_id = p.id 
         LEFT JOIN enrollments e ON s.id = e.student_id 
         WHERE s.id = ? AND s.deleted_at IS NULL 
         AND (e.theology_class_id = ? OR ? IS NULL)`,
        [student_id, theology_class_id, theology_class_id]
      );

      if (!Array.isArray(studentCheck) || studentCheck.length === 0) {
        throw new Error('Student not found or not enrolled in the specified theology class');
      }

      // Verify subject exists
      const [subjectCheck] = await connection.execute(
        'SELECT id, name FROM subjects WHERE id = ?',
        [subject_id]
      );

      if (!Array.isArray(subjectCheck) || subjectCheck.length === 0) {
        throw new Error('Subject not found');
      }

      // Calculate grade based on score
      let grade = 'F';
      if (numericScore >= 90) grade = 'A';
      else if (numericScore >= 80) grade = 'B';
      else if (numericScore >= 70) grade = 'C';
      else if (numericScore >= 60) grade = 'D';

      // Check if result already exists
      const [existingResult] = await connection.execute(
        `SELECT id FROM results 
         WHERE student_id = ? AND subject_id = ? AND term_id = ? 
         AND academic_year_id = ? AND is_theology = 1`,
        [student_id, subject_id, term_id, currentAcademicYear]
      );

      if (Array.isArray(existingResult) && existingResult.length > 0) {
        // Update existing result
        await connection.execute(
          `UPDATE results 
           SET score = ?, grade = ?, theology_class_id = ?, updated_at = NOW()
           WHERE id = ?`,
          [numericScore, grade, theology_class_id, (existingResult[0] as any).id]
        );
      } else {
        // Insert new result
        await connection.execute(
          `INSERT INTO results 
           (student_id, subject_id, score, grade, term_id, academic_year_id, 
            theology_class_id, is_theology, created_at, updated_at) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
          [student_id, subject_id, numericScore, grade, term_id, currentAcademicYear, theology_class_id, 1]
        );
      }

      await connection.commit();

      return NextResponse.json({
        success: true,
        message: 'Theology result saved successfully',
        data: {
          student_id,
          subject_id,
          score: numericScore,
          grade,
          is_theology: true
        }
      });

    } catch (error) {
      await connection.rollback();
      throw error;
    }

  } catch (error: any) {
    console.error('Error saving theology result:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to save theology result'
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
