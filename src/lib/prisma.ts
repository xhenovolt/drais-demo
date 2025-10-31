// Since this project uses a custom database connection, we'll create a compatibility layer
import { getConnection } from '@/lib/db';

// Create a prisma-like interface using the existing database connection
export const prisma = {
  async $transaction(operations: any[]) {
    const connection = await getConnection();
    try {
      await connection.beginTransaction();
      const results = [];
      for (const operation of operations) {
        const result = await operation;
        results.push(result);
      }
      await connection.commit();
      return results;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      await connection.end();
    }
  },

  async $executeRaw(query: string, ...params: any[]) {
    const connection = await getConnection();
    try {
      const [result] = await connection.execute(query, params);
      return result;
    } finally {
      await connection.end();
    }
  },

  async $queryRaw(query: string, ...params: any[]) {
    const connection = await getConnection();
    try {
      const [rows] = await connection.execute(query, params);
      return rows;
    } finally {
      await connection.end();
    }
  }
};

// Export withTransaction as a standalone function
export const withTransaction = async (callback: (connection: any) => Promise<any>) => {
  const connection = await getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    await connection.end();
  }
};
