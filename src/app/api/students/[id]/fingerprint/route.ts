import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  let connection;
  try {
    const resolvedParams = await params;
    const studentId = resolvedParams.id;
    connection = await getConnection();

    const [result] = await connection.execute(
      'SELECT id, method, is_active, created_at, last_used_at FROM student_fingerprints WHERE student_id = ?',
      [studentId]
    );

    const hasFingerprint = Array.isArray(result) && result.length > 0;

    return NextResponse.json({
      success: true,
      data: {
        hasFingerprint,
        hasPhone: hasFingerprint,
        hasBiometric: hasFingerprint,
        fingerprint: hasFingerprint ? result[0] : null
      }
    });

  } catch (error: any) {
    console.error('Fingerprint check error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to check fingerprint status'
    }, { status: 500 });
  } finally {
    if (connection) await connection.end();
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  let connection;
  try {
    const resolvedParams = await params;
    const studentId = resolvedParams.id;
    const body = await req.json();
    const { credential_id, public_key, method = 'passkey' } = body;

    if (!credential_id || !public_key) {
      return NextResponse.json({
        success: false,
        error: 'credential_id and public_key are required'
      }, { status: 400 });
    }

    connection = await getConnection();

    // Check if student exists
    const [studentCheck] = await connection.execute(
      'SELECT id FROM students WHERE id = ?',
      [studentId]
    );

    if (!Array.isArray(studentCheck) || studentCheck.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Student not found'
      }, { status: 404 });
    }

    // Insert or update fingerprint
    await connection.execute(
      `INSERT INTO student_fingerprints (student_id, method, credential_id, public_key)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
         method = VALUES(method),
         credential_id = VALUES(credential_id),
         public_key = VALUES(public_key),
         is_active = 1,
         created_at = CURRENT_TIMESTAMP`,
      [studentId, method, credential_id, public_key]
    );

    return NextResponse.json({
      success: true,
      message: 'Fingerprint registered successfully'
    });

  } catch (error: any) {
    console.error('Fingerprint registration error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to register fingerprint'
    }, { status: 500 });
  } finally {
    if (connection) await connection.end();
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  let connection;
  try {
    const resolvedParams = await params;
    const studentId = resolvedParams.id;
    connection = await getConnection();

    await connection.execute(
      'UPDATE student_fingerprints SET is_active = 0 WHERE student_id = ?',
      [studentId]
    );

    return NextResponse.json({
      success: true,
      message: 'Fingerprint deactivated successfully'
    });

  } catch (error: any) {
    console.error('Fingerprint deletion error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to deactivate fingerprint'
    }, { status: 500 });
  } finally {
    if (connection) await connection.end();
  }
}
