import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { AttendanceDetailComponent } from './attendance-detail.component';
import { AttendanceListComponent } from './attendance-list.component';
import { AttendanceReportComponent } from './attendance-report.component';
import { EmployeeFormComponent } from './employee-form.component';
import { EmployeeListComponent } from './employee-list.component';
import { EmployeeProfileComponent } from './employee-profile.component';
import { LeaveComponent } from './leave.component';
import { PayrollGenerateComponent } from './payroll-generate.component';
import { PayrollListComponent } from './payroll-list.component';
import { PayslipComponent } from './payslip.component';

@NgModule({
  declarations: [
    EmployeeListComponent,
    EmployeeFormComponent,
    EmployeeProfileComponent,
    AttendanceListComponent,
    AttendanceReportComponent,
    AttendanceDetailComponent,
    LeaveComponent,
    PayrollListComponent,
    PayrollGenerateComponent,
    PayslipComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatSidenavModule,
    MatSnackBarModule,
    MatTableModule,
    MatTabsModule
  ]
})
export class HrmModule {}
