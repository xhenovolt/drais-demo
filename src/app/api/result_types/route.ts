import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

export async function GET(req: NextRequest) {
  let connection;
  try {
    connection = await getConnection();
    const [rows] = await connection.execute(`
      SELECT id, school_id, name, code, description, weight, status, deadline, created_at, updated_at 
      FROM result_types 
      ORDER BY created_at DESC
    `);
    
    return NextResponse.json({ 
      success: true, 
      data: rows 
    });
  } catch (error: any) {
    console.error('Error fetching result types:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch result types',
      details: error.message 
    }, { status: 500 });
  } finally {
    if (connection) {
      try {
        await connection.end();
      } catch (closeError) {
        console.error('Error closing connection:', closeError);
      }
    }
  }
}

export async function POST(req: NextRequest) {
  let connection;
  try {
    const body = await req.json();
    const { name, code, description, weight, deadline, school_id } = body;

    if (!name || !code || weight === undefined) {
      return NextResponse.json({ 
        success: false, 
        error: 'Name, code, and weight are required' 
      }, { status: 400 });
    }

    connection = await getConnection();
    
    // Check if code already exists for this school
    const [existing] = await connection.execute(`
      SELECT id FROM result_types WHERE code = ? AND school_id = ?
    `, [code, school_id || 1]);

    if (Array.isArray(existing) && existing.length > 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Result type code already exists for this school' 
      }, { status: 409 });
    }
    
    const deadlineValue = deadline ? new Date(deadline).toISOString().slice(0, 19).replace('T', ' ') : null;
    
    const [result] = await connection.execute(`
      INSERT INTO result_types (school_id, name, code, description, weight, deadline, status, created_at) 
      VALUES (?, ?, ?, ?, ?, ?, 'active', NOW())
    `, [school_id || 1, name, code, description || null, parseFloat(weight), deadlineValue]);

    const insertId = (result as any).insertId;

    return NextResponse.json({ 
      success: true, 
      id: insertId,
      message: 'Result type created successfully'
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating result type:', error);
    
    // Handle specific MySQL errors
    let errorMessage = 'Failed to create result type';
    if (error.code === 'ER_DUP_ENTRY') {
      errorMessage = 'Result type code already exists';
    } else if (error.code === 'ER_NO_SUCH_TABLE') {
      errorMessage = 'Database table not found. Please check database setup.';
    } else if (error.code === 'ER_BAD_FIELD_ERROR') {
      errorMessage = 'Database schema error. Please check table structure.';
    }

    return NextResponse.json({ 
      success: false, 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  } finally {
    if (connection) {
      try {
        await connection.end();
      } catch (closeError) {
        console.error('Error closing connection:', closeError);
      }
    }
  }
}
