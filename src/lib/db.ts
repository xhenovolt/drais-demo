import mysql from 'mysql2/promise';

let pool: mysql.Pool | null = null;

export function getPool() {
  if (pool) return pool;
  pool = mysql.createPool({
    host: process.env.MYSQL_HOST || '127.0.0.1',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DB || 'drais_school',
    waitForConnections: true,
    connectionLimit: 10,
    timezone: 'Z',
  });
  return pool;
}

export async function query(sql: string, params: any[] = []) {
  const p = getPool();
  const [rows] = await p.execute(sql, params);
  return rows;
}

export async function getConnection() {
  try {
    return await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || '',
      database: process.env.DB_NAME || 'drais_school',
    });
  } catch (error) {
    console.error('Database connection error:', error);
    throw new Error('Failed to connect to the database. Please check your database configuration.');
  }
}

export async function withTransaction<T>(fn: (conn: mysql.PoolConnection) => Promise<T>): Promise<T> {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const result = await fn(conn);
    await conn.commit();
    return result;
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}

// Add default export for compatibility
export default getConnection;
