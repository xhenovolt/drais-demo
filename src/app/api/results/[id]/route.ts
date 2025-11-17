import { NextResponse } from "next/server";
import { getConnection } from "@/lib/db";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const id = parseInt(params.id, 10);
  const body = await req.json();

  if (!id || !body.score) {
    return NextResponse.json({ success: false, error: "Invalid input" }, { status: 400 });
  }

  try {
    const conn = await getConnection();
    try {
      // Update the result in the database
      await conn.execute(
        'UPDATE results SET score = ?, grade = ?, remarks = ? WHERE id = ?',
        [parseFloat(body.score), body.grade || null, body.remarks || null, id]
      );

      const [rows]: any = await conn.execute('SELECT * FROM results WHERE id = ?', [id]);
      return NextResponse.json({ success: true, updatedResult: rows[0] });
    } finally {
      await conn.end();
    }
  } catch (error) {
    console.error("Error updating result:", error);
    return NextResponse.json({ success: false, error: "Failed to update result" }, { status: 500 });
  }
}
