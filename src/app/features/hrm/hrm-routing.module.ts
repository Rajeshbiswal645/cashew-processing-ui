import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AttendanceDetailComponent } from './attendance-detail.component';
import { AttendanceListComponent } from './attendance-list.component';
import { AttendanceReportComponent } from './attendance-report.component';
import { EmployeeListComponent } from './employee-list.component';
import { EmployeeProfileComponent } from './employee-profile.component';
import { LeaveComponent } from './leave.component';
import { PayrollGenerateComponent } from './payroll-generate.component';
import { PayrollListComponent } from './payroll-list.component';
import { PayslipComponent } from './payslip.component';

const routes: Routes = [
  { path: 'employees', component: EmployeeListComponent },
  { path: 'employees/:id', component: EmployeeProfileComponent },
  { path: 'attendance', component: AttendanceListComponent },
  { path: 'attendance/report', component: AttendanceReportComponent },
  { path: 'attendance/:id', component: AttendanceDetailComponent },
  { path: 'leave', component: LeaveComponent },
  { path: 'payroll', component: PayrollListComponent },
  { path: 'payroll/generate', component: PayrollGenerateComponent },
  { path: 'payroll/:id', component: PayslipComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HrmRoutingModule {}
