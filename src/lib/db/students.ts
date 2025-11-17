import { getConnection } from '../db';

export async function getStudentsList() {
  const conn = await getConnection();
  try {
    const [rows]: any = await conn.execute(`
      SELECT 
        s.id,
        s.admission_no,
        s.school_id,
        s.class_id,
        s.stream_id,
        s.status,
        s.admission_date,
        p.first_name,
        p.last_name,
        p.gender,
        p.dob,
        p.photo_url,
        c.name as class_name,
        st.name as stream_name
      FROM students s
      JOIN people p ON s.person_id = p.id
      LEFT JOIN classes c ON s.class_id = c.id
      LEFT JOIN streams st ON s.stream_id = st.id
      ORDER BY s.admission_no
    `);
    return rows;
  } finally {
    await conn.end();
  }
}

export async function getStudentById(id: number) {
  const conn = await getConnection();
  try {
    const [rows]: any = await conn.execute(`
      SELECT 
        s.*,
        p.first_name,
        p.last_name,
        p.gender,
        p.dob,
        p.photo_url,
        p.email,
        p.phone,
        c.name as class_name,
        st.name as stream_name
      FROM students s
      JOIN people p ON s.person_id = p.id
      LEFT JOIN classes c ON s.class_id = c.id
      LEFT JOIN streams st ON s.stream_id = st.id
      WHERE s.id = ?
    `, [id]);
    return rows[0] || null;
  } finally {
    await conn.end();
  }
}
