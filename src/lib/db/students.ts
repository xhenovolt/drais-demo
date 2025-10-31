import { getConnection } from '../db';

export interface StudentListItem {
  id: number;
  first_name: string;
  last_name: string;
  other_name?: string;
  admission_no: string;
  class_name?: string;
  stream_name?: string;
  status: string;
  photo_url?: string;
}

export async function getStudentsList(filters: {
  school_id?: number;
  class_id?: string;
  stream_id?: string;
  status?: string;
  search?: string;
  limit?: number;
  offset?: number;
} = {}): Promise<StudentListItem[]> {
  const connection = await getConnection();
  
  try {
    let sql = `
      SELECT DISTINCT
        s.id,
        p.first_name,
        p.last_name,
        p.other_name,
        s.admission_no,
        c.name as class_name,
        st.name as stream_name,
        s.status,
        p.photo_url
      FROM students s
      JOIN people p ON s.person_id = p.id
      LEFT JOIN enrollments e ON s.id = e.student_id AND e.status = 'active'
      LEFT JOIN classes c ON e.class_id = c.id
      LEFT JOIN streams st ON e.stream_id = st.id
      WHERE s.deleted_at IS NULL
    `;

    const params: any[] = [];

    if (filters.school_id) {
      sql += ` AND s.school_id = ?`;
      params.push(filters.school_id);
    }

    if (filters.class_id) {
      sql += ` AND c.id = ?`;
      params.push(filters.class_id);
    }

    if (filters.stream_id) {
      sql += ` AND st.id = ?`;
      params.push(filters.stream_id);
    }

    if (filters.status) {
      sql += ` AND s.status = ?`;
      params.push(filters.status);
    }

    if (filters.search) {
      sql += ` AND (
        p.first_name LIKE ? OR 
        p.last_name LIKE ? OR 
        p.other_name LIKE ? OR
        s.admission_no LIKE ? OR
        CONCAT(p.first_name, ' ', p.last_name) LIKE ?
      )`;
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
    }

    sql += ` ORDER BY p.first_name, p.last_name`;

    if (filters.limit) {
      sql += ` LIMIT ?`;
      params.push(filters.limit);
      
      if (filters.offset) {
        sql += ` OFFSET ?`;
        params.push(filters.offset);
      }
    }

    const [rows] = await connection.execute(sql, params);
    return rows as StudentListItem[];
    
  } finally {
    await connection.end();
  }
}

export async function getStudentById(id: number): Promise<StudentListItem | null> {
  const connection = await getConnection();
  
  try {
    const sql = `
      SELECT DISTINCT
        s.id,
        p.first_name,
        p.last_name,
        p.other_name,
        s.admission_no,
        c.name as class_name,
        st.name as stream_name,
        s.status,
        p.photo_url
      FROM students s
      JOIN people p ON s.person_id = p.id
      LEFT JOIN enrollments e ON s.id = e.student_id AND e.status = 'active'
      LEFT JOIN classes c ON e.class_id = c.id
      LEFT JOIN streams st ON e.stream_id = st.id
      WHERE s.id = ? AND s.deleted_at IS NULL
    `;

    const [rows] = await connection.execute(sql, [id]);
    const students = rows as StudentListItem[];
    return students.length > 0 ? students[0] : null;
    
  } finally {
    await connection.end();
  }
}
