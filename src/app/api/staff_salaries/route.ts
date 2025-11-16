import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

// CRUD for staff_salaries
export async function GET(req: NextRequest) {
  try {
    const connection = await getConnection();
    const [rows] = await connection.execute('SELECT * FROM staff_salaries');
    await connection.end();
    return NextResponse.json(rows);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { staff_id, month, period_month, definition_id, amount } = await req.json();
    const connection = await getConnection();
    await connection.execute(
      'INSERT INTO staff_salaries (staff_id, month, period_month, definition_id, amount) VALUES (?, ?, ?, ?, ?)',
      [staff_id, month, period_month, definition_id, amount]
    );
    await connection.end();
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { id, staff_id, month, period_month, definition_id, amount } = await req.json();
    const connection = await getConnection();
    await connection.execute(
      'UPDATE staff_salaries SET staff_id = ?, month = ?, period_month = ?, definition_id = ?, amount = ? WHERE id = ?',
      [staff_id, month, period_month, definition_id, amount, id]
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
    await connection.execute('DELETE FROM staff_salaries WHERE id = ?', [id]);
    await connection.end();
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}