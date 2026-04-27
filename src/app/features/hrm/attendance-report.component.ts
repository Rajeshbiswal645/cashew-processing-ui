import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { AttendanceReportRow } from './hrm.models';
import { HrmService } from './hrm.service';

@Component({
  selector: 'app-attendance-report',
  templateUrl: './attendance-report.component.html',
  styleUrls: ['./attendance-report.component.scss']
})
export class AttendanceReportComponent {
  readonly displayedColumns = ['employeeName', 'totalDays', 'presentDays', 'absentDays', 'leaves', 'attendancePercent', 'actions'];
  readonly departments = this.hrmService.getDepartments();
  readonly months = this.hrmService.getAvailableMonths();

  rows: AttendanceReportRow[] = [];
  employeeOptions: Array<{ label: string; value: string }> = [{ label: 'All Employees', value: 'ALL' }];
  selectedEmployeeId = 'ALL';
  selectedMonth = '2026-04';
  selectedDepartment = 'ALL';
  isLoading = true;

  constructor(
    private readonly hrmService: HrmService,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {
    this.hrmService.getEmployees().subscribe((employees) => {
      this.employeeOptions = [
        { label: 'All Employees', value: 'ALL' },
        ...employees.map((employee) => ({
          label: `${employee.firstName} ${employee.lastName} (${employee.employeeId})`,
          value: employee.employeeId
        }))
      ];
    });

    this.route.queryParamMap.subscribe((params) => {
      this.selectedMonth = params.get('month') ?? '2026-04';
      this.selectedDepartment = params.get('department') ?? 'ALL';
      this.selectedEmployeeId = params.get('employeeId') ?? 'ALL';
      this.loadReport();
    });
  }

  updateFilters(): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        month: this.selectedMonth,
        department: this.selectedDepartment,
        employeeId: this.selectedEmployeeId
      },
      queryParamsHandling: 'merge'
    });
  }

  openEmployee(row: AttendanceReportRow): void {
    void this.router.navigate(['/attendance', row.employeeId], {
      queryParams: { month: this.selectedMonth }
    });
  }

  private loadReport(): void {
    this.isLoading = true;
    this.hrmService
      .getAttendanceReport({
        employeeId: this.selectedEmployeeId,
        month: this.selectedMonth,
        department: this.selectedDepartment
      })
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe((rows) => {
        this.rows = rows;
      });
  }
}
