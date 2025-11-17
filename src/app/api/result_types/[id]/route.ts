import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const body = await req.json();
    const { name, code, description, weight, deadline } = body;
    const resolvedParams = await params;
    const id = resolvedParams.id;

    if (!name || !code || weight === undefined) {
      return NextResponse.json({ 
        success: false, 
        error: 'Name, code, and weight are required' 
      }, { status: 400 });
    }

    const connection = await getConnection();
    
    const deadlineValue = deadline ? new Date(deadline).toISOString().slice(0, 19).replace('T', ' ') : null;
    
    await connection.execute(`
      UPDATE result_types 
      SET name = ?, code = ?, description = ?, weight = ?, deadline = ?, updated_at = NOW() 
      WHERE id = ?
    `, [name, code, description || null, weight, deadlineValue, id]);

    await connection.end();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating result type:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to update result type' 
    }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    const connection = await getConnection();
    
    await connection.execute('DELETE FROM result_types WHERE id = ?', [id]);
    await connection.end();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting result type:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to delete result type' 
    }, { status: 500 });
  }
}
