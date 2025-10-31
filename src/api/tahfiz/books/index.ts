import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const books = await db.query('SELECT * FROM tahfiz_books');
      res.status(200).json(books);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch books' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
