import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { student_id, new_status } = body;

  if (!student_id || !new_status) {
    return NextResponse.json({ success: false, error: 'Missing required parameters' }, { status: 400 });
  }

  const connection = await getConnection();

  try {
    await connection.execute(
      `UPDATE students SET status = ? WHERE id = ?`,
      [new_status, student_id]
    );

    await connection.execute(
      `INSERT INTO audit_log (actor_user_id, action, entity_type, entity_id, changes_json) VALUES (?, ?, ?, ?, ?)`,
      [null, 'update_status', 'students', student_id, JSON.stringify({ status: new_status })]
    );

    return NextResponse.json({ success: true, message: 'Student status updated successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update student status' }, { status: 500 });
  } finally {
    await connection.end();
  }
}
