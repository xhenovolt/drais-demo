import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

// Database connection configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'drais_school',
  port: parseInt(process.env.DB_PORT || '3306')
};

async function getConnection() {
  return await mysql.createConnection(dbConfig);
}

export async function GET(request: NextRequest) {
  let connection;
  try {
    const { searchParams } = new URL(request.url);
    const schoolId = searchParams.get('school_id');

    if (!schoolId) {
      return NextResponse.json({
        success: false,
        message: 'School ID is required'
      }, { status: 400 });
    }

    connection = await getConnection();

    const [rows] = await connection.execute(`
      SELECT 
        p.id,
        p.first_name,
        p.last_name,
        p.email,
        'Tahfiz' as subject
      FROM staff s
      JOIN people p ON s.person_id = p.id
      WHERE s.school_id = ? AND s.status = 'active'
      ORDER BY p.first_name, p.last_name
    `, [schoolId]);

    return NextResponse.json({
      success: true,
      data: rows
    });

  } catch (error: any) {
    console.error('Error fetching teachers:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch teachers',
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
