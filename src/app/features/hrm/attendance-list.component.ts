import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { AttendanceStatus, DailyAttendanceRow } from './hrm.models';
import { HrmService } from './hrm.service';

@Component({
  selector: 'app-attendance-list',
  templateUrl: './attendance-list.component.html',
  styleUrls: ['./attendance-list.component.scss']
})
export class AttendanceListComponent {
  readonly displayedColumns = ['employeeName', 'employeeId', 'designation', 'status', 'actions'];
  readonly departments = this.hrmService.getDepartments();
  readonly statusOptions = this.hrmService.getAttendanceStatuses();

  readonly filtersForm = this.formBuilder.nonNullable.group({
    date: '2026-04-15',
    department: 'ALL'
  });

  rows: DailyAttendanceRow[] = [];
  isLoading = true;
  isSaving = false;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly hrmService: HrmService,
    private readonly snackBar: MatSnackBar,
    private readonly router: Router
  ) {
    this.filtersForm.valueChanges.subscribe(() => this.loadRows());
    this.loadRows();
  }

  updateStatus(employeeId: string, status: AttendanceStatus): void {
    this.rows = this.rows.map((row) => (row.employeeId === employeeId ? { ...row, status } : row));
  }

  saveAttendance(): void {
    this.isSaving = true;
    this.hrmService
      .saveDailyAttendance(this.filtersForm.controls.date.value, this.rows)
      .pipe(finalize(() => (this.isSaving = false)))
      .subscribe(() => {
        this.snackBar.open('Attendance saved successfully', 'Close', { duration: 2200 });
      });
  }

  openReport(): void {
    void this.router.navigate(['/attendance/report'], {
      queryParams: {
        month: this.filtersForm.controls.date.value.slice(0, 7),
        department: this.filtersForm.controls.department.value
      }
    });
  }

  openEmployee(employeeId: string): void {
    void this.router.navigate(['/attendance', employeeId], {
      queryParams: { month: this.filtersForm.controls.date.value.slice(0, 7) }
    });
  }

  trackByEmployee(index: number, row: DailyAttendanceRow): string {
    return row.employeeId;
  }

  private loadRows(): void {
    this.isLoading = true;
    this.hrmService
      .getDailyAttendance(this.filtersForm.getRawValue())
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe((rows) => {
        this.rows = rows;
      });
  }
}
