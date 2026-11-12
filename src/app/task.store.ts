import { Injectable, computed, signal } from '@angular/core';

export type Priority = 'high' | 'medium' | 'low';
export type Category = 'Work' | 'Personal' | 'Learning';
export interface Task { id: string; title: string; category: Category; priority: Priority; dueDate: string; completed: boolean; createdAt: string; }
type NewTask = Pick<Task, 'title' | 'category' | 'priority' | 'dueDate'>;

@Injectable({ providedIn: 'root' })
export class TaskStore {
  readonly tasks = signal<Task[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly total = computed(() => this.tasks().length);
  readonly completed = computed(() => this.tasks().filter(task => task.completed).length);
  readonly pending = computed(() => this.total() - this.completed());
  readonly completion = computed(() => this.total() ? Math.round(this.completed() / this.total() * 100) : 0);

  constructor() { void this.refresh(); }

  async refresh(): Promise<void> {
    this.loading.set(true);
    try {
      this.tasks.set(await this.request<Task[]>('/api/tasks'));
      this.error.set('');
    } catch (error) { this.fail(error); }
    finally { this.loading.set(false); }
  }

  async add(input: NewTask): Promise<void> {
    try {
      const task = await this.request<Task>('/api/tasks', { method: 'POST', body: JSON.stringify(input) });
      this.tasks.update(tasks => [task, ...tasks]);
      this.error.set('');
    } catch (error) { this.fail(error); }
  }

  async toggle(id: string): Promise<void> {
    const current = this.tasks().find(task => task.id === id);
    if (!current) return;
    try {
      const task = await this.request<Task>(`/api/tasks/${encodeURIComponent(id)}`, {
        method: 'PATCH', body: JSON.stringify({ completed: !current.completed }),
      });
      this.tasks.update(tasks => tasks.map(item => item.id === id ? task : item));
      this.error.set('');
    } catch (error) { this.fail(error); }
  }

  async remove(id: string): Promise<void> {
    try {
      await this.request<void>(`/api/tasks/${encodeURIComponent(id)}`, { method: 'DELETE' });
      this.tasks.update(tasks => tasks.filter(task => task.id !== id));
      this.error.set('');
    } catch (error) { this.fail(error); }
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(path, { ...options, headers: { 'Content-Type': 'application/json', ...options.headers } });
    if (!response.ok) {
      const detail = await response.json().catch(() => ({})) as { error?: string };
      throw new Error(detail.error || `Request failed (${response.status}).`);
    }
    return response.status === 204 ? undefined as T : await response.json() as T;
  }

  private fail(error: unknown): void {
    this.error.set(error instanceof Error ? error.message : 'The server could not be reached.');
  }
}
