import { Component } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  readonly primaryLinks = [
    { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
    { label: 'Procurement', icon: 'inventory_2', route: '/procurement' },
    { label: 'Vendor & Buyers', icon: 'groups', route: '/parties' },
    { label: 'QC', icon: 'fact_check', route: '/qc' },
    { label: 'Drying', icon: 'wb_sunny', route: '/drying' },
    { label: 'Processing', icon: 'settings_input_component', route: '/processing' },
    { label: 'Inventory', icon: 'warehouse', route: '/inventory' },
    { label: 'Employees', icon: 'badge', route: '/employees' },
    { label: 'Attendance', icon: 'calendar_month', route: '/attendance' },
    { label: 'Leave', icon: 'event_note', route: '/leave' },
    { label: 'Payroll', icon: 'payments', route: '/payroll' },
    { label: 'Sales', icon: 'local_mall', route: '/sales' },
    { label: 'Accounts', icon: 'account_balance_wallet', route: '/accounts' },
    { label: 'Reports', icon: 'assessment', route: '/reports' },
    { label: 'Settings', icon: 'settings', route: '/dashboard' }
  ];
}
