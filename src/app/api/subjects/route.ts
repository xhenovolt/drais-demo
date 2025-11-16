import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type'); // Filter by subject_type if provided
  
  const connection = await getConnection();
  
  let sql = 'SELECT id, name, code, subject_type FROM subjects';
  const params: any[] = [];
  
  if (type) {
    sql += ' WHERE subject_type = ?';
    params.push(type);
  }
  
  sql += ' ORDER BY name ASC';
  
  const [rows] = await connection.execute(sql, params);
  await connection.end();
  return NextResponse.json({ data: rows });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const id = body.id;
  const name = (body.name || '').trim();
  if (!name) {
    return NextResponse.json({ error: 'Subject name is required' }, { status: 400 });
  }
  const code = (body.code || '').trim() || null;
  const subject_type = body.subject_type || 'core';
  
  // Validate subject_type
  const validTypes = ['core', 'elective', 'tahfiz', 'extra'];
  if (!validTypes.includes(subject_type)) {
    return NextResponse.json({ 
      error: `Invalid subject_type. Must be one of: ${validTypes.join(', ')}` 
    }, { status: 400 });
  }
  
  const school_id = 1;
  const connection = await getConnection();
  try {
    if (id) {
      await connection.execute('UPDATE subjects SET name=?, code=?, subject_type=? WHERE id=?', [name, code, subject_type, id]);
      await connection.end();
      return NextResponse.json({ success: true, id });
    } else {
      const [result] = await connection.execute('INSERT INTO subjects (school_id, name, code, subject_type) VALUES (?, ?, ?, ?)', [school_id, name, code, subject_type]);
      const insertId = (result as any).insertId;
      await connection.end();
      return NextResponse.json({ success: true, id: insertId });
    }
  } catch (e: any) {
    await connection.end();
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'ID is required' }, { status: 400 });
  }
  const connection = await getConnection();
  try {
    await connection.execute('DELETE FROM subjects WHERE id=?', [id]);
    await connection.end();
    return NextResponse.json({ success: true });
  } catch (e: any) {
    await connection.end();
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
