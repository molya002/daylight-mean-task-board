import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Category, Priority, Task } from './task.store';

@Component({ selector: 'app-task-form', standalone: true, imports: [CommonModule, FormsModule], template: `
  <form class="task-form" #taskForm="ngForm" (ngSubmit)="submit(taskForm)">
    <label class="field-label" for="task-title">What needs to get done?</label>
    <input id="task-title" name="title" type="text" maxlength="100" placeholder="e.g. Finish the project outline" required [(ngModel)]="title" #titleField="ngModel" />
    <p class="field-error" *ngIf="titleField.invalid && titleField.touched">Please enter a task name.</p>
    <div class="form-grid">
      <div><label class="field-label" for="task-category">Category</label><select id="task-category" name="category" [(ngModel)]="category"><option>Work</option><option>Personal</option><option>Learning</option></select></div>
      <div><label class="field-label" for="task-priority">Priority</label><select id="task-priority" name="priority" [(ngModel)]="priority"><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option></select></div>
      <div><label class="field-label" for="task-due">Due date</label><input id="task-due" name="dueDate" type="date" required [(ngModel)]="dueDate" /></div>
    </div>
    <button class="primary-button" type="submit" [disabled]="taskForm.invalid">＋ Add task</button>
  </form>` })
export class TaskFormComponent {
  @Output() taskAdded = new EventEmitter<Pick<Task, 'title' | 'category' | 'priority' | 'dueDate'>>();
  title = ''; category: Category = 'Work'; priority: Priority = 'medium'; dueDate = new Date().toLocaleDateString('en-CA');
  submit(form: NgForm): void { if (form.invalid || !this.title.trim()) return; this.taskAdded.emit({ title: this.title.trim(), category: this.category, priority: this.priority, dueDate: this.dueDate }); this.title = ''; form.controls['title'].markAsPristine(); form.controls['title'].markAsUntouched(); }
}
