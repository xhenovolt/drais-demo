import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const term_id = searchParams.get('term_id');
  const class_id = searchParams.get('class_id');
  let sql = 'SELECT id, name, class_id, subject_id, date, start_time, end_time FROM exams';
  const params: any[] = [];
  const where: string[] = [];
  if (term_id) { where.push('term_id=?'); params.push(term_id); }
  if (class_id) { where.push('class_id=?'); params.push(class_id); }
  if (where.length) sql += ' WHERE ' + where.join(' AND ');
  sql += ' ORDER BY date DESC, id DESC';
  const connection = await getConnection();
  const [rows] = await connection.execute(sql, params);
  await connection.end();
  return NextResponse.json({ data: rows });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!body.class_id || !body.subject_id || !body.name) {
    return NextResponse.json({ error: 'class_id, subject_id, and name are required.' }, { status: 400 });
  }
  const connection = await getConnection();
  try {
    await connection.execute(
      'INSERT INTO exams (term_id, class_id, subject_id, name, date, start_time, end_time, school_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [body.term_id || null, body.class_id, body.subject_id, body.name, body.date || null, body.start_time || null, body.end_time || null, 1]
    );
    await connection.end();
    return NextResponse.json({ success: true });
  } catch (e: any) {
    await connection.end();
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'id required.' }, { status: 400 });
  }
  const connection = await getConnection();
  try {
    await connection.execute('DELETE FROM exams WHERE id=?', [id]);
    await connection.end();
    return NextResponse.json({ success: true });
  } catch (e: any) {
    await connection.end();
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
