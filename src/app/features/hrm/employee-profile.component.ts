import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { AttendanceRecord, Employee, LeaveRecord, PayrollRecord } from './hrm.models';
import { HrmService } from './hrm.service';

@Component({
  selector: 'app-employee-profile',
  templateUrl: './employee-profile.component.html',
  styleUrls: ['./employee-profile.component.scss']
})
export class EmployeeProfileComponent {
  employee: Employee | null = null;
  attendanceRecords: AttendanceRecord[] = [];
  leaveRecords: LeaveRecord[] = [];
  salaryRecords: PayrollRecord[] = [];
  isLoading = true;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly hrmService: HrmService,
    private readonly snackBar: MatSnackBar
  ) {
    this.route.paramMap.subscribe((params) => {
      const employeeId = params.get('id');
      if (!employeeId) {
        this.isLoading = false;
        return;
      }

      this.loadProfile(employeeId);
    });
  }

  get fullName(): string {
    return this.employee ? `${this.employee.firstName} ${this.employee.lastName}`.trim() : '';
  }

  get statusClass(): string {
    return this.employee?.status.toLowerCase() ?? '';
  }

  get presentDays(): number {
    return this.attendanceRecords.filter((record) => record.status === 'PRESENT').length;
  }

  get pendingLeaves(): number {
    return this.leaveRecords.filter((record) => record.status === 'PENDING').length;
  }

  get netSalary(): number {
    return this.salaryRecords[0]?.netSalary ?? 0;
  }

  private loadProfile(employeeId: string): void {
    this.isLoading = true;
    forkJoin({
      employee: this.hrmService.getEmployeeById(employeeId),
      attendance: this.hrmService.getAttendance(),
      leaves: this.hrmService.getLeaves(),
      payroll: this.hrmService.getPayroll()
    })
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe(({ employee, attendance, leaves, payroll }) => {
        this.employee = employee ?? null;
        this.attendanceRecords = attendance.filter((record) => record.employeeId === employeeId);
        this.leaveRecords = leaves.filter((record) => record.employeeId === employeeId);
        this.salaryRecords = payroll.filter((record) => record.employeeId === employeeId);

        if (!this.employee) {
          this.snackBar.open(`Employee ${employeeId} not found`, 'Close', { duration: 2600 });
        }
      });
  }
}
