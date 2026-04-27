import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from '../core/api.service';

export interface DashboardActivity {
  icon: string;
  tone: 'success' | 'amber' | 'primary';
  title: string;
  detail: string;
  time: string;
}

export interface DashboardSummary {
  totalParties: number;
  activeBatches: number;
  pendingSalesOrders: number;
  unpaidInvoices: number;
  stockSummary: Record<string, unknown>;
  recentActivities: DashboardActivity[];
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  constructor(private readonly api: ApiService) {}

  getSummary(): Observable<DashboardSummary> {
    return this.api.get<DashboardSummary>('dashboard/summary').pipe(
      map((summary) => ({
        ...summary,
        recentActivities: (summary.recentActivities ?? []).map((item) => ({
          icon: item.icon || 'info',
          tone: item.tone === 'success' || item.tone === 'amber' ? item.tone : 'primary',
          title: item.title,
          detail: item.detail,
          time: item.time
        }))
      }))
    );
  }
}
