import { NextResponse } from "next/server";
import { db } from "@/lib/db"; // Assume you have a database connection utility

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const id = parseInt(params.id, 10);
  const body = await req.json();

  if (!id || !body.score) {
    return NextResponse.json({ success: false, error: "Invalid input" }, { status: 400 });
  }

  try {
    // Update the result in the database
    const updatedResult = await db.result.update({
      where: { id },
      data: {
        score: parseFloat(body.score),
        grade: body.grade || null,
        remarks: body.remarks || null,
      },
    });

    return NextResponse.json({ success: true, updatedResult });
  } catch (error) {
    console.error("Error updating result:", error);
    return NextResponse.json({ success: false, error: "Failed to update result" }, { status: 500 });
  }
}
