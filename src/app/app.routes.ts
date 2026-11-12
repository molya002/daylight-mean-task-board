import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { InsightsComponent } from './insights.component';

export const routes: Routes = [
  { path: '', component: DashboardComponent, title: 'My tasks · Daylight' },
  { path: 'insights', component: InsightsComponent, title: 'Insights · Daylight' },
  { path: '**', redirectTo: '' },
];
