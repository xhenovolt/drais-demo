import { NextResponse } from "next/server";
import { getConnection } from "@/lib/db";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const id = parseInt(params.id, 10);
  
  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  let connection;
  try {
    const body = await req.json();
    connection = await getConnection();

    // Update the result record
    const [result] = await connection.execute(
      `UPDATE results SET 
       score = ?, 
       grade = ?, 
       updated_at = NOW() 
       WHERE id = ?`,
      [body.score, body.grade, id]
    );

    if ((result as any).affectedRows === 0) {
      return NextResponse.json({ error: "Result not found" }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      message: "Result updated successfully" 
    });

  } catch (error: any) {
    console.error('Error updating result:', error);
    return NextResponse.json({ 
      error: "Failed to update result",
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

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const id = parseInt(params.id, 10);
  
  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  let connection;
  try {
    connection = await getConnection();

    // Delete the result record
    const [result] = await connection.execute(
      "DELETE FROM results WHERE id = ?",
      [id]
    );

    if ((result as any).affectedRows === 0) {
      return NextResponse.json({ error: "Result not found" }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      message: "Result deleted successfully" 
    });

  } catch (error: any) {
    console.error('Error deleting result:', error);
    return NextResponse.json({ 
      error: "Failed to delete result",
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

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const id = parseInt(params.id, 10);
  
  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  let connection;
  try {
    connection = await getConnection();

    // Get the specific result with student and subject details
    const [rows] = await connection.execute(
      `SELECT 
        r.*,
        CONCAT(p.first_name, ' ', p.last_name) as student_name,
        s.admission_no,
        sub.name as subject_name,
        c.name as class_name,
        t.name as term_name
      FROM results r
      JOIN students s ON r.student_id = s.id
      JOIN people p ON s.person_id = p.id
      JOIN subjects sub ON r.subject_id = sub.id
      LEFT JOIN classes c ON r.class_id = c.id
      LEFT JOIN terms t ON r.term_id = t.id
      WHERE r.id = ?`,
      [id]
    );

    const results = rows as any[];
    if (results.length === 0) {
      return NextResponse.json({ error: "Result not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: results[0]
    });

  } catch (error: any) {
    console.error('Error fetching result:', error);
    return NextResponse.json({ 
      error: "Failed to fetch result",
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
