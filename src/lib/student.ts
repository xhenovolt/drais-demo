import { pool } from './db';

export async function generateAdmissionNo(): Promise<string> {
  const year = new Date().getFullYear();
  const [rows]: any = await pool.query(`SELECT admission_no FROM students WHERE admission_no LIKE ? ORDER BY id DESC LIMIT 1`, [`${year}/%`]);
  let seq = 1;
  if (rows.length) {
    const last: string = rows[0].admission_no || '';
    const parts = last.split('/');
    const num = parseInt(parts[1]||'0',10); seq = num + 1;
  }
  const padded = String(seq).padStart(4,'0');
  return `${year}/${padded}`;
}
