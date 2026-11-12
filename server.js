import { MongoClient } from 'mongodb';
import { createApp } from './app.js';

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
try {
  await client.connect();
  const db = client.db(process.env.MONGODB_DB || 'mean_task_board');
  await db.command({ ping: 1 });
  const tasks = db.collection('tasks');
  await tasks.createIndex({ createdAt: -1 });
  const port = Number(process.env.PORT || 3000);
  const server = createApp(tasks).listen(port, '0.0.0.0', () => {
    console.log(`Daylight MEAN app listening on port ${port}`);
  });
  const stop = () => server.close(() => client.close());
  process.once('SIGINT', stop);
  process.once('SIGTERM', stop);
} catch (error) {
  await client.close();
  console.error('Startup failed:', error);
  process.exitCode = 1;
}
