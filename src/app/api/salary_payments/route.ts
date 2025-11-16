import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

// CRUD for salary_payments
export async function GET(req: NextRequest) {
  try {
    const connection = await getConnection();
    const [rows] = await connection.execute('SELECT * FROM salary_payments');
    await connection.end();
    return NextResponse.json(rows);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { staff_id, wallet_id, amount, method, reference } = await req.json();
    const connection = await getConnection();
    await connection.execute(
      'INSERT INTO salary_payments (staff_id, wallet_id, amount, method, reference) VALUES (?, ?, ?, ?, ?)',
      [staff_id, wallet_id, amount, method, reference]
    );
    await connection.end();
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { id, staff_id, wallet_id, amount, method, reference } = await req.json();
    const connection = await getConnection();
    await connection.execute(
      'UPDATE salary_payments SET staff_id = ?, wallet_id = ?, amount = ?, method = ?, reference = ? WHERE id = ?',
      [staff_id, wallet_id, amount, method, reference, id]
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
    await connection.execute('DELETE FROM salary_payments WHERE id = ?', [id]);
    await connection.end();
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}