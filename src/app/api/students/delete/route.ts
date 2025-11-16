import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ success: false, message: 'Student ID is required.' }, { status: 400 });
    }

    const connection = await getConnection();

    // Soft delete the student by setting `deleted_at`
    await connection.execute(
      `UPDATE students SET deleted_at = NOW() WHERE id = ?`,
      [id]
    );

    await connection.end();

    return NextResponse.json({ success: true, message: 'Student deleted successfully.' });
  } catch (error: any) {
    console.error('Error deleting student:', error);
    return NextResponse.json({ success: false, message: 'Failed to delete student.', error: error.message }, { status: 500 });
  }
}