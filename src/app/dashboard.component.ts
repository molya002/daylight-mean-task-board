import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TaskCardComponent } from './task-card.component';
import { TaskFormComponent } from './task-form.component';
import { TaskStore } from './task.store';

type Filter = 'all' | 'pending' | 'completed';
@Component({ selector: 'app-dashboard', standalone: true, imports: [CommonModule, FormsModule, TaskCardComponent, TaskFormComponent], template: `
  <div class="page-container">
    <section class="hero"><div><p class="eyebrow">YOUR DAILY SPACE</p><h1>Make room for <em>what matters.</em></h1><p class="hero-copy">A calmer place to organize your plans, celebrate progress, and keep moving forward.</p></div><div class="hero-illustration" aria-hidden="true"><div class="sun-disc"></div><div class="sun-ring"></div><span class="illustration-star star-one">✳</span><span class="illustration-star star-two">✧</span></div></section>
    <section class="stats-grid" aria-label="Task summary"><div class="stat-card"><span class="stat-icon peach">◉</span><div><strong>{{ store.total() }}</strong><span>Total tasks</span></div></div><div class="stat-card"><span class="stat-icon lavender">◷</span><div><strong>{{ store.pending() }}</strong><span>In progress</span></div></div><div class="stat-card"><span class="stat-icon mint">✓</span><div><strong>{{ store.completed() }}</strong><span>Completed</span></div></div></section>
    <div class="content-grid"><section class="tasks-panel"><div class="section-heading"><div><p class="eyebrow">YOUR TASKS</p><h2>Today & beyond</h2></div><span class="task-count">{{ filteredTasks().length }} tasks</span></div>
      <div class="controls"><div class="filter-group" role="group" aria-label="Filter tasks"><button type="button" *ngFor="let option of filters" [class.selected]="filter() === option" (click)="filter.set(option)">{{ option | titlecase }}</button></div><label class="search-box"><span>⌕</span><input type="search" placeholder="Search tasks" aria-label="Search tasks" [ngModel]="searchQuery()" (ngModelChange)="searchQuery.set($event)" /></label></div>
      <p class="api-error" *ngIf="store.error()" role="alert">{{ store.error() }} <button type="button" (click)="store.refresh()">Retry</button></p>
      <div class="task-list"><p *ngIf="store.loading()">Loading tasks…</p><app-task-card *ngFor="let task of filteredTasks(); trackBy: trackTask" [task]="task" (toggle)="store.toggle($event)" (remove)="store.remove($event)" /><div class="empty-state" *ngIf="!store.loading() && filteredTasks().length === 0"><span>✳</span><h3>Nothing here yet</h3><p>Try another filter or add a new task to get started.</p></div></div>
    </section><aside class="side-panel"><div class="add-panel"><p class="eyebrow">START SOMETHING NEW</p><h2>Add a task</h2><p class="panel-copy">Small steps add up. What's on your mind?</p><app-task-form (taskAdded)="store.add($event)" /></div><div class="quote-panel"><span>✦</span><p>Small steps make big plans feel possible.</p><small>A gentle reminder from Daylight</small></div></aside></div>
  </div>` })
export class DashboardComponent {
  readonly filters: Filter[] = ['all', 'pending', 'completed'];
  readonly filter = signal<Filter>('all');
  readonly searchQuery = signal('');
  readonly filteredTasks = computed(() => { const filter = this.filter(); const search = this.searchQuery().toLowerCase().trim(); return this.store.tasks().filter(task => (filter === 'all' || (filter === 'completed') === task.completed) && task.title.toLowerCase().includes(search)); });
  constructor(readonly store: TaskStore) {}
  trackTask(_index: number, task: { id: string }): string { return task.id; }
}
