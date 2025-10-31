import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const connection = await getConnection();
    const [rows] = await connection.execute('SELECT * FROM result_submission_deadlines');
    await connection.end();
    return NextResponse.json({ data: rows });
  } catch (error: any) {
    console.error('Error fetching deadlines:', error.message);
    return NextResponse.json({ error: 'Failed to fetch deadlines. Please try again later.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!body.examId || !body.deadlineDate) {
    return NextResponse.json({ error: 'examId and deadlineDate are required' }, { status: 400 });
  }

  try {
    const connection = await getConnection();
    const formattedDeadline = new Date(body.deadlineDate).toISOString().slice(0, 19).replace('T', ' '); // Format to 'YYYY-MM-DD HH:MM:SS'
    await connection.execute(
      'INSERT INTO result_submission_deadlines (exam_id, deadline, created_by) VALUES (?, ?, ?)',
      [body.examId, formattedDeadline, body.createdBy || null]
    );
    const [result] = await connection.query('SELECT LAST_INSERT_ID() as id');
    await connection.end();
    return NextResponse.json({ success: true, id: result[0].id }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating deadline:', error.message);
    return NextResponse.json({ error: 'Failed to create deadline. Please try again later.' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  if (!body.id || !body.examId || !body.deadlineDate) {
    return NextResponse.json({ error: 'id, examId, and deadlineDate are required' }, { status: 400 });
  }

  try {
    const connection = await getConnection();
    await connection.execute(
      'UPDATE result_submission_deadlines SET exam_id=?, deadline_date=?, created_by=? WHERE id=?',
      [body.examId, body.deadlineDate, body.createdBy || null, body.id]
    );
    await connection.end();
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating deadline:', error.message);
    return NextResponse.json({ error: 'Failed to update deadline. Please try again later.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const body = await req.json();
  if (!body.id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 });
  }

  try {
    const connection = await getConnection();
    await connection.execute('DELETE FROM result_submission_deadlines WHERE id=?', [body.id]);
    await connection.end();
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting deadline:', error.message);
    return NextResponse.json({ error: 'Failed to delete deadline. Please try again later.' }, { status: 500 });
  }
}
