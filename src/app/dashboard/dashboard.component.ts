import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { DashboardService } from './dashboard.service';

interface StatCard {
  title: string;
  value: string;
  unit?: string;
  icon: string;
  tone: 'primary' | 'amber' | 'gold' | 'sage' | 'rose';
}

interface ActivityItem {
  icon: string;
  tone: 'success' | 'amber' | 'primary';
  title: string;
  detail: string;
  time: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  statCards: StatCard[] = [
    { title: 'Total Parties', value: '0', icon: 'groups', tone: 'primary' },
    { title: 'Active Batches', value: '0', icon: 'precision_manufacturing', tone: 'amber' },
    { title: 'Pending Sales', value: '0', unit: 'Orders', icon: 'shopping_cart', tone: 'rose' },
    { title: 'Unpaid Invoices', value: '0', unit: 'Bills', icon: 'receipt_long', tone: 'gold' },
    { title: 'Total RCN Stock', value: '0', unit: 'kg', icon: 'inventory_2', tone: 'sage' }
  ];

  activityFeed: ActivityItem[] = [];

  readonly quickActions = [
    { label: 'New RCN Batch', route: '/procurement', icon: 'add' },
    { label: 'Open Pipeline', route: '/processing', icon: 'alt_route' },
    { label: 'View Sales', route: '/sales', icon: 'trending_up' }
  ];

  readonly performanceCards = [
    { label: 'Dispatch Readiness', value: '92%', note: '18 lots approved for dispatch' },
    { label: 'Factory Yield', value: '84.6%', note: 'Above weekly target by 2.1%' },
    { label: 'Vendor Deliveries', value: '27', note: '6 vendors delivered this week' }
  ];

  constructor(
    private readonly router: Router,
    private readonly snackBar: MatSnackBar,
    private readonly dashboardService: DashboardService
  ) {
    this.loadSummary();
  }

  navigate(route: string): void {
    void this.router.navigateByUrl(route);
  }

  goTo(section: string): void {
    switch (section) {
      case 'parties':
        void this.router.navigate(['/parties']);
        break;

      case 'batches':
        void this.router.navigate(['/processing']);
        break;

      case 'sales':
        void this.router.navigate(['/sales']);
        break;

      case 'invoices':
        void this.router.navigate(['/accounts']);
        break;

      case 'reports':
        void this.router.navigate(['/reports']);
        break;

      default:
        this.snackBar.open('This section is not available yet.', 'Close', { duration: 2200 });
        break;
    }
  }

  openSettings(): void {
    this.snackBar.open('Settings panel is coming soon.', 'Close', { duration: 2200 });
  }

  viewAllActivity(): void {
    void this.router.navigate(['/processing']);
  }

  private loadSummary(): void {
    this.dashboardService.getSummary().subscribe({
      next: (summary) => {
        this.statCards = [
          { title: 'Total Parties', value: String(summary.totalParties), icon: 'groups', tone: 'primary' },
          { title: 'Active Batches', value: String(summary.activeBatches), icon: 'precision_manufacturing', tone: 'amber' },
          { title: 'Pending Sales', value: String(summary.pendingSalesOrders), unit: 'Orders', icon: 'shopping_cart', tone: 'rose' },
          { title: 'Unpaid Invoices', value: String(summary.unpaidInvoices), unit: 'Bills', icon: 'receipt_long', tone: 'gold' },
          {
            title: 'Total RCN Stock',
            value: this.formatStock(summary.stockSummary['totalRcnKg']),
            unit: 'kg',
            icon: 'inventory_2',
            tone: 'sage'
          }
        ];

        this.activityFeed = summary.recentActivities.length
          ? summary.recentActivities
          : [
              {
                icon: 'info',
                tone: 'primary',
                title: 'No recent activities',
                detail: 'Operational activity will appear here once transactions are recorded.',
                time: 'Recently'
              }
            ];

        this.performanceCards[0] = {
          label: 'Dispatch Readiness',
          value: String(summary.stockSummary['approvedRcnLots'] ?? 0),
          note: `${summary.stockSummary['pendingQcLots'] ?? 0} lots pending QC`
        };
        this.performanceCards[1] = {
          label: 'Factory Yield',
          value: `${summary.activeBatches}`,
          note: 'Active procurement lots currently in the system'
        };
        this.performanceCards[2] = {
          label: 'Vendor Deliveries',
          value: `${summary.totalParties}`,
          note: 'Party master records available for operations'
        };
      },
      error: () => {
        this.snackBar.open('Unable to load dashboard summary.', 'Close', { duration: 2400 });
      }
    });
  }

  private formatStock(value: unknown): string {
    const numeric = Number(value ?? 0);
    return Number.isNaN(numeric) ? '0' : numeric.toLocaleString('en-IN', { maximumFractionDigits: 0 });
  }
}
