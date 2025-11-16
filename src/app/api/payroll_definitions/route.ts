import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

// CRUD for payroll_definitions
export async function GET(req: NextRequest) {
  try {
    const connection = await getConnection();
    const [rows] = await connection.execute('SELECT * FROM payroll_definitions');
    await connection.end();
    return NextResponse.json(rows);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, type } = await req.json();
    const connection = await getConnection();
    await connection.execute(
      'INSERT INTO payroll_definitions (name, type) VALUES (?, ?)',
      [name, type]
    );
    await connection.end();
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { id, name, type } = await req.json();
    const connection = await getConnection();
    await connection.execute(
      'UPDATE payroll_definitions SET name = ?, type = ? WHERE id = ?',
      [name, type, id]
    );
    await connection.end();
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    const connection = await getConnection();
    await connection.execute('DELETE FROM payroll_definitions WHERE id = ?', [id]);
    await connection.end();
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}