import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { MongoClient } from 'mongodb';
import { createApp } from './app.js';

test('Angular app and MongoDB REST API work together', async () => {
  const client = new MongoClient(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017', {
    serverSelectionTimeoutMS: 2000,
  });
  await client.connect();
  const db = client.db(`mean_task_board_test_${Date.now()}`);
  const server = createApp(db.collection('tasks')).listen(0, '127.0.0.1');
  await once(server, 'listening');
  const base = `http://127.0.0.1:${server.address().port}`;
  const request = async (path, method, body) => {
    const response = await fetch(base + path, {
      method, headers: { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    return { status: response.status, body: response.status === 204 ? null : await response.json() };
  };
  try {
    assert.equal((await request('/api/health', 'GET')).body.status, 'ok');
    assert.deepEqual((await request('/api/tasks', 'GET')).body, []);
    const input = { title: 'Finish assignment', category: 'Learning', priority: 'high', dueDate: '2026-11-18' };
    const bad = await request('/api/tasks', 'POST', { ...input, title: '' });
    assert.equal(bad.status, 400);
    assert.equal((await request('/api/tasks', 'POST', { ...input, dueDate: '2026-02-30' })).status, 400);
    const created = await request('/api/tasks', 'POST', input);
    assert.equal(created.status, 201);
    assert.equal(created.body.title, input.title);
    assert.equal(created.body.completed, false);
    const id = created.body.id;
    assert.equal((await request('/api/tasks', 'GET')).body.length, 1);
    const updated = await request(`/api/tasks/${id}`, 'PATCH', { completed: true });
    assert.equal(updated.body.completed, true);
    assert.equal((await request(`/api/tasks/${id}`, 'DELETE')).status, 204);
    assert.deepEqual((await request('/api/tasks', 'GET')).body, []);
    assert.equal((await request(`/api/tasks/${id}`, 'DELETE')).status, 404);
    const page = await fetch(base + '/insights');
    assert.equal(page.status, 200);
    assert.match(await page.text(), /Daylight/);
  } finally {
    await new Promise(resolve => server.close(resolve));
    await db.dropDatabase();
    await client.close();
  }
});
