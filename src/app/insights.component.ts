import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Category, TaskStore } from './task.store';

@Component({ selector: 'app-insights', standalone: true, imports: [CommonModule, RouterLink], template: `
  <div class="page-container insights-page"><p class="eyebrow">A MOMENT TO REFLECT</p><h1>Your progress, <em>at a glance.</em></h1><p class="hero-copy">Every finished task is a step forward. Here's how your plans are coming along.</p>
    <div class="insights-grid"><section class="insight-feature"><span class="feature-icon">✳</span><p>Overall completion</p><strong>{{ store.completion() }}%</strong><div class="progress-track" role="progressbar" [attr.aria-valuenow]="store.completion()" aria-valuemin="0" aria-valuemax="100" aria-label="Overall completion"><div [style.width.%]="store.completion()"></div></div><small>{{ store.completed() }} of {{ store.total() }} tasks completed</small></section>
    <section class="insight-breakdown"><p class="eyebrow">BY CATEGORY</p><h2>Where your energy goes</h2><div class="category-row" *ngFor="let category of categories"><span class="category-badge" [ngClass]="category.toLowerCase()">{{ category }}</span><div class="mini-track"><div [style.width.%]="categoryPercent(category)"></div></div><strong>{{ categoryCount(category) }}</strong></div><p class="breakdown-note" *ngIf="store.total() === 0">Add a task to see your breakdown here.</p></section></div>
    <div class="insight-callout"><div><p class="eyebrow">KEEP IT GOING</p><h2>Ready for your next small step?</h2><p>Make a plan, focus on one thing, and enjoy the progress.</p></div><a class="primary-button" routerLink="/">Go to my tasks →</a></div>
  </div>` })
export class InsightsComponent {
  readonly categories: Category[] = ['Work', 'Personal', 'Learning'];
  constructor(readonly store: TaskStore) {}
  categoryCount(category: Category): number { return this.store.tasks().filter(task => task.category === category).length; }
  categoryPercent(category: Category): number { return this.store.total() ? this.categoryCount(category) / this.store.total() * 100 : 0; }
}
