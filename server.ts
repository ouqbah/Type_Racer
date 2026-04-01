import express from 'express';
import { createServer as createViteServer } from 'vite';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from './src/firebase';
import path from 'path';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get('/api/scores', async (req, res) => {
    try {
      const q = query(
        collection(db, 'scores'),
        orderBy('wpm', 'desc'),
        limit(50)
      );
      const snapshot = await getDocs(q);
      const scores = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          // Convert Firestore Timestamp to ISO string for JSON serialization
          timestamp: data.timestamp?.toDate()?.toISOString() || new Date().toISOString()
        };
      });
      res.json(scores);
    } catch (error) {
      console.error('Error fetching scores:', error);
      res.status(500).json({ error: 'Failed to fetch scores' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
