import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './auth/auth.guard';
import { InvoiceDetailComponent } from './features/accounts/invoice-detail.component';
import { InvoiceListComponent } from './features/accounts/invoice-list.component';
import { LoginComponent } from './auth/login/login.component';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { RcnListComponent } from './features/batches/rcn/rcn-list.component';
import { QcListComponent } from './features/qc/qc-list.component';
import { DryingListComponent } from './features/drying/drying-list.component';
import { ProcessingDetailComponent } from './features/processing/processing-detail.component';
import { InventoryListComponent } from './features/inventory/inventory-list.component';
import { DispatchComponent } from './features/sales/dispatch.component';
import { SalesDetailComponent } from './features/sales/sales-detail.component';
import { SalesListComponent } from './features/sales/sales-list.component';
import { AttendanceDetailComponent } from './features/hrm/attendance-detail.component';
import { AttendanceListComponent } from './features/hrm/attendance-list.component';
import { AttendanceReportComponent } from './features/hrm/attendance-report.component';
import { EmployeeListComponent } from './features/hrm/employee-list.component';
import { EmployeeProfileComponent } from './features/hrm/employee-profile.component';
import { LeaveComponent } from './features/hrm/leave.component';
import { PayrollGenerateComponent } from './features/hrm/payroll-generate.component';
import { PayrollListComponent } from './features/hrm/payroll-list.component';
import { PayslipComponent } from './features/hrm/payslip.component';
import { ProcessingComponent } from './pages/processing/processing.component';
import { ReportsComponent } from './pages/reports/reports.component';

const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [AuthGuard],
    data: { publicOnly: true }
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivateChild: [AuthGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'procurement', component: RcnListComponent },
      { path: 'parties', loadChildren: () => import('./features/parties/parties.module').then((m) => m.PartiesModule) },
      { path: 'qc', component: QcListComponent },
      { path: 'drying', component: DryingListComponent },
      { path: 'processing', component: ProcessingComponent },
      { path: 'processing/:id', component: ProcessingDetailComponent },
      { path: 'inventory', component: InventoryListComponent },
      { path: 'sales', component: SalesListComponent },
      { path: 'sales/:id/dispatch', component: DispatchComponent },
      { path: 'sales/:id', component: SalesDetailComponent },
      { path: 'accounts', component: InvoiceListComponent },
      { path: 'accounts/:id', component: InvoiceDetailComponent },
      { path: 'employees', component: EmployeeListComponent },
      { path: 'employees/:id', component: EmployeeProfileComponent },
      { path: 'attendance', component: AttendanceListComponent },
      { path: 'attendance/report', component: AttendanceReportComponent },
      { path: 'attendance/:id', component: AttendanceDetailComponent },
      { path: 'leave', component: LeaveComponent },
      { path: 'payroll', component: PayrollListComponent },
      { path: 'payroll/generate', component: PayrollGenerateComponent },
      { path: 'payroll/:id', component: PayslipComponent },
      { path: 'reports', component: ReportsComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
