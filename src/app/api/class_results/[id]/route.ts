import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

// Mock database connection - replace with your actual DB
async function updateClassResult(id: string, data: any) {
  // This would connect to your MySQL database
  // Example using your schema:
  // UPDATE class_results SET score = ?, updated_at = NOW() WHERE id = ?
  
  console.log(`Updating class_result ${id} with:`, data);
  
  // Simulate database update
  return {
    id: parseInt(id),
    ...data,
    updated_at: new Date().toISOString()
  };
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const { score, grade, remarks } = body;

    // Validate input
    if (score !== null && (isNaN(score) || score < 0 || score > 100)) {
      return NextResponse.json(
        { error: 'Score must be between 0 and 100' },
        { status: 400 }
      );
    }

    // Update the database
    const resolvedParams = await params;
    const updatedResult = await updateClassResult(resolvedParams.id, {
      score: score ? parseFloat(score) : null,
      grade: grade || null,
      remarks: remarks || null
    });

    // Log audit trail
    // INSERT INTO audit_log (actor_user_id, action, entity_type, entity_id, changes_json, created_at)
    // VALUES (?, 'edit_result', 'class_result', ?, ?, NOW())

    // Revalidate the results page to refresh server-side data
    revalidatePath('/academics/results');

    return NextResponse.json({
      success: true,
      data: updatedResult
    });

  } catch (error) {
    console.error('Error updating class result:', error);
    return NextResponse.json(
      { error: 'Failed to update result' },
      { status: 500 }
    );
  }
}
