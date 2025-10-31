import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

export async function GET(req: NextRequest) {
  let connection;
  
  try {
    const { searchParams } = new URL(req.url);
    const schoolId = parseInt(searchParams.get('school_id') || '1');

    connection = await getConnection();

    const [departments] = await connection.execute(`
      SELECT 
        d.id,
        d.name,
        d.description,
        d.head_staff_id,
        d.budget,
        d.created_at,
        p.first_name as head_first_name,
        p.last_name as head_last_name,
        s.staff_no as head_staff_no,
        COUNT(DISTINCT s2.id) as staff_count
      FROM departments d
      LEFT JOIN staff s ON d.head_staff_id = s.id
      LEFT JOIN people p ON s.person_id = p.id
      LEFT JOIN staff s2 ON s2.department_id = d.id AND s2.status = 'active' AND s2.deleted_at IS NULL
      WHERE d.school_id = ? AND (d.deleted_at IS NULL OR d.deleted_at = '')
      GROUP BY d.id, d.name, d.description, d.head_staff_id, d.budget, d.created_at, p.first_name, p.last_name, s.staff_no
      ORDER BY d.name
    `, [schoolId]);

    return NextResponse.json({
      success: true,
      data: departments
    });

  } catch (error: any) {
    console.error('Departments fetch error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch departments'
    }, { status: 500 });
  } finally {
    if (connection) await connection.end();
  }
}

export async function POST(req: NextRequest) {
  let connection;
  
  try {
    const body = await req.json();
    const { school_id = 1, name, description, head_staff_id, budget = 0 } = body;

    if (!name) {
      return NextResponse.json({
        success: false,
        error: 'Department name is required'
      }, { status: 400 });
    }

    connection = await getConnection();

    const [result] = await connection.execute(`
      INSERT INTO departments (school_id, name, description, head_staff_id, budget)
      VALUES (?, ?, ?, ?, ?)
    `, [school_id, name, description, head_staff_id, budget]);

    return NextResponse.json({
      success: true,
      message: 'Department created successfully',
      data: { id: result.insertId }
    });

  } catch (error: any) {
    console.error('Department creation error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create department'
    }, { status: 500 });
  } finally {
    if (connection) await connection.end();
  }
}

export async function DELETE(req: NextRequest) {
  let connection;
  
  try {
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Department ID is required'
      }, { status: 400 });
    }

    connection = await getConnection();

    await connection.execute(`
      UPDATE departments 
      SET deleted_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [id]);

    return NextResponse.json({
      success: true,
      message: 'Department deleted successfully'
    });

  } catch (error: any) {
    console.error('Department deletion error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete department'
    }, { status: 500 });
  } finally {
    if (connection) await connection.end();
  }
}
