import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '../../../../lib/db';
import { getServerSession } from 'next-auth';

// Helper function to execute queries
async function query(sql: string, params: any[] = []): Promise<any> {
  const connection = await getConnection();
  try {
    const [rows] = await connection.execute(sql, params);
    return rows;
  } finally {
    await connection.end();
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.role?.includes('teacher')) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    const date = url.searchParams.get('date');
    const class_id = url.searchParams.get('class_id');
    const stream_id = url.searchParams.get('stream_id');

    // If ID is provided, return single plan
    if (id) {
      const rows: any = await query('SELECT * FROM tahfiz_plans WHERE id = ?', [id]);
      return NextResponse.json(rows[0] || null);
    }

    // If date is provided, filter by date and optional class/stream
    if (date) {
      let sql = `SELECT * FROM tahfiz_plans WHERE school_id = ? AND assigned_date = ?`;
      const params: any[] = [session.user.school_id, date];

      if (class_id) {
        sql += ` AND class_id = ?`;
        params.push(class_id);
      }

      if (stream_id) {
        sql += ` AND stream_id = ?`;
        params.push(stream_id);
      }

      const plans = await query(sql, params);
      return NextResponse.json(plans);
    }

    // Default: return all plans with joins
    const rows: any = await query(
      `SELECT p.*, b.title AS book_title, g.name AS group_name 
       FROM tahfiz_plans p 
       LEFT JOIN tahfiz_books b ON p.book_id = b.id 
       LEFT JOIN tahfiz_groups g ON p.group_id = g.id 
       ORDER BY assigned_date DESC`
    );
    return NextResponse.json(rows);
    
  } catch (error) {
    console.error('Get plans error:', error);
    return NextResponse.json({ error: 'Failed to fetch plans' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const cols = ['school_id','teacher_id','class_id','stream_id','assigned_date','portion_text','portion_unit','expected_length','type','notes','book_id','group_id'];
  const vals = cols.map(c => body[c] ?? null);
  const res: any = await query(`INSERT INTO tahfiz_plans (${cols.join(',')}) VALUES (${cols.map(()=>'?').join(',')})`, vals);
  return NextResponse.json({ id: res.insertId });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { id, ...rest } = body;
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  const fields = Object.keys(rest).map(k => `${k} = ?`).join(', ');
  await query(`UPDATE tahfiz_plans SET ${fields} WHERE id = ?`, [...Object.values(rest), id]);
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  await query('DELETE FROM tahfiz_plans WHERE id = ?', [id]);
  return NextResponse.json({ success: true });
}
