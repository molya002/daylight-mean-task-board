import express from 'express';
import { ObjectId } from 'mongodb';
import { join } from 'node:path';

const categorySet = new Set(['Work', 'Personal', 'Learning']);
const prioritySet = new Set(['high', 'medium', 'low']);

class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

function validInput(body) {
  const title = typeof body?.title === 'string' ? body.title.trim() : '';
  if (!title || title.length > 100) throw new HttpError(400, 'Title must contain 1–100 characters.');
  if (!categorySet.has(body.category)) throw new HttpError(400, 'Choose a valid category.');
  if (!prioritySet.has(body.priority)) throw new HttpError(400, 'Choose a valid priority.');
  const date = typeof body.dueDate === 'string' ? new Date(`${body.dueDate}T00:00:00Z`) : null;
  if (typeof body.dueDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(body.dueDate) ||
      !date || Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== body.dueDate) {
    throw new HttpError(400, 'Choose a valid due date.');
  }
  return { title, category: body.category, priority: body.priority, dueDate: body.dueDate };
}

function taskId(id) {
  if (!/^[a-f0-9]{24}$/i.test(id)) throw new HttpError(400, 'Invalid task ID.');
  return new ObjectId(id);
}

function output(task) {
  return { id: task._id.toString(), title: task.title, category: task.category,
    priority: task.priority, dueDate: task.dueDate, completed: task.completed,
    createdAt: task.createdAt.toISOString() };
}

export function createApp(tasks, { staticDirectory = join(process.cwd(), 'dist', 'mean-task-board', 'browser') } = {}) {
  const app = express();
  app.disable('x-powered-by');
  app.use('/api', (_req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });
  app.use('/api', express.json({ limit: '16kb' }));

  app.get('/api/health', async (_req, res) => {
    await tasks.findOne({}, { projection: { _id: 1 } });
    res.json({ status: 'ok', database: 'connected' });
  });
  app.get('/api/tasks', async (_req, res) => {
    const list = await tasks.find({}).sort({ createdAt: -1 }).limit(200).toArray();
    res.json(list.map(output));
  });
  app.post('/api/tasks', async (req, res) => {
    const task = { ...validInput(req.body), completed: false, createdAt: new Date() };
    const { insertedId } = await tasks.insertOne(task);
    res.status(201).location(`/api/tasks/${insertedId}`).json(output({ _id: insertedId, ...task }));
  });
  app.patch('/api/tasks/:id', async (req, res) => {
    if (typeof req.body?.completed !== 'boolean') throw new HttpError(400, 'Completed must be true or false.');
    const task = await tasks.findOneAndUpdate({ _id: taskId(req.params.id) },
      { $set: { completed: req.body.completed } }, { returnDocument: 'after' });
    if (!task) throw new HttpError(404, 'Task not found.');
    res.json(output(task));
  });
  app.delete('/api/tasks/:id', async (req, res) => {
    const { deletedCount } = await tasks.deleteOne({ _id: taskId(req.params.id) });
    if (!deletedCount) throw new HttpError(404, 'Task not found.');
    res.sendStatus(204);
  });
  app.use('/api', (_req, _res, next) => next(new HttpError(404, 'API route not found.')));

  app.use(express.static(staticDirectory));
  app.use((req, res, next) => {
    if (req.method !== 'GET' || req.path.includes('.')) return next();
    res.sendFile(join(staticDirectory, 'index.html'));
  });
  app.use((error, _req, res, next) => {
    if (res.headersSent) return next(error);
    if (error instanceof HttpError) return res.status(error.status).json({ error: error.message });
    if (error.type === 'entity.parse.failed') return res.status(400).json({ error: 'Malformed JSON.' });
    if (error.type === 'entity.too.large') return res.status(413).json({ error: 'Request body is too large.' });
    console.error('Request failed:', error);
    res.status(500).json({ error: 'Unexpected server error.' });
  });
  return app;
}
