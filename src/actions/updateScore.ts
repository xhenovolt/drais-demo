'use server'

import { db } from '@/lib/db';
import { revalidatePath, revalidateTag } from 'next/cache';

export async function updateScore(
  resultId: number, 
  newScore: number, 
  grade?: string, 
  remarks?: string
) {
  try {
    // Fetch current record for audit
    const current = await db.query(
      'SELECT * FROM class_results WHERE id = ?', 
      [resultId]
    );

    if (!current[0]) {
      throw new Error('Result not found');
    }

    // Update the record
    await db.query(
      'UPDATE class_results SET score = ?, grade = ?, remarks = ?, updated_at = NOW() WHERE id = ?',
      [newScore, grade || current[0].grade, remarks || current[0].remarks, resultId]
    );

    // Log the change
    const changes = {
      before: current[0],
      after: { ...current[0], score: newScore, grade, remarks }
    };

    await db.query(
      'INSERT INTO audit_log (action, entity_type, entity_id, changes_json, created_at) VALUES (?, ?, ?, ?, NOW())',
      ['edit_result', 'class_result', resultId, JSON.stringify(changes)]
    );

    // Revalidate cache
    revalidateTag('class-results');
    revalidatePath('/academics/results');

    return { success: true, data: { ...current[0], score: newScore, grade, remarks } };
  } catch (error) {
    console.error('Server action error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
