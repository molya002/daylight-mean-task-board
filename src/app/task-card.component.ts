import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Task } from './task.store';

@Component({ selector: 'app-task-card', standalone: true, imports: [CommonModule], template: `
  <article class="task-card" [class.is-complete]="task.completed">
    <button class="check-button" type="button" [class.checked]="task.completed" [attr.aria-label]="task.completed ? 'Mark ' + task.title + ' incomplete' : 'Complete ' + task.title" (click)="toggle.emit(task.id)">{{ task.completed ? '✓' : '' }}</button>
    <div class="task-content"><h3>{{ task.title }}</h3><div class="task-meta"><span class="category-badge" [ngClass]="task.category.toLowerCase()">{{ task.category }}</span><span>{{ task.dueDate | date:'MMM d, y' }}</span></div></div>
    <span class="priority-badge" [ngClass]="task.priority">{{ task.priority }}</span>
    <button class="icon-button" type="button" [attr.aria-label]="'Delete ' + task.title" title="Delete task" (click)="remove.emit(task.id)">×</button>
  </article>` })
export class TaskCardComponent { @Input({ required: true }) task!: Task; @Output() toggle = new EventEmitter<string>(); @Output() remove = new EventEmitter<string>(); }
