import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method === 'DELETE') {
    try {
      await db.query('DELETE FROM tahfiz_books WHERE id = ?', [id]);
      res.status(200).json({ message: 'Book deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete book' });
    }
  } else {
    res.setHeader('Allow', ['DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
