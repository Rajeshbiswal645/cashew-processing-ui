import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { finalize } from 'rxjs/operators';
import { Employee, LeaveApplicationValue, LeaveRecord, LeaveStatus, LeaveType } from './hrm.models';
import { HrmService } from './hrm.service';

@Component({
  selector: 'app-leave',
  templateUrl: './leave.component.html',
  styleUrls: ['./leave.component.scss']
})
export class LeaveComponent implements AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  readonly displayedColumns = ['employeeName', 'leaveType', 'fromDate', 'toDate', 'reason', 'status', 'actions'];
  readonly dataSource = new MatTableDataSource<LeaveRecord>([]);
  readonly leaveTypes: LeaveType[] = ['Casual Leave', 'Sick Leave', 'Paid Leave'];

  readonly leaveForm = this.formBuilder.nonNullable.group({
    employeeId: ['', Validators.required],
    leaveType: 'Casual Leave' as LeaveType,
    fromDate: ['', Validators.required],
    toDate: ['', Validators.required],
    reason: ['', Validators.required]
  });

  employees: Employee[] = [];
  isLoading = true;
  isSubmitting = false;
  isDrawerOpen = false;
  updatingLeaveId: string | null = null;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly hrmService: HrmService,
    private readonly snackBar: MatSnackBar
  ) {
    this.loadPage();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  get emptyState(): boolean {
    return !this.isLoading && this.dataSource.data.length === 0;
  }

  openDrawer(): void {
    this.isDrawerOpen = true;
    this.leaveForm.reset({
      employeeId: '',
      leaveType: 'Casual Leave',
      fromDate: '',
      toDate: '',
      reason: ''
    });
  }

  closeDrawer(): void {
    this.isDrawerOpen = false;
  }

  applyLeave(): void {
    this.leaveForm.markAllAsTouched();
    if (this.leaveForm.invalid) {
      return;
    }

    const raw = this.leaveForm.getRawValue();
    const payload: LeaveApplicationValue = {
      employeeId: raw.employeeId,
      leaveType: raw.leaveType,
      fromDate: raw.fromDate,
      toDate: raw.toDate,
      reason: raw.reason.trim()
    };

    this.isSubmitting = true;
    this.hrmService
      .applyLeave(payload)
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe(() => {
        this.snackBar.open('Leave request submitted successfully', 'Close', { duration: 2200 });
        this.closeDrawer();
        this.loadPage();
      });
  }

  updateLeaveStatus(record: LeaveRecord, status: LeaveStatus): void {
    this.updatingLeaveId = record.id;
    this.hrmService
      .updateLeaveStatus(record.id, status)
      .pipe(finalize(() => (this.updatingLeaveId = null)))
      .subscribe(() => {
        this.snackBar.open(`${record.employeeName} leave ${status.toLowerCase()}`, 'Close', { duration: 2200 });
        this.loadPage();
      });
  }

  statusClass(status: LeaveStatus): string {
    return status.toLowerCase();
  }

  private loadPage(): void {
    this.isLoading = true;
    this.hrmService.getEmployees().subscribe((employees) => {
      this.employees = employees;
    });

    this.hrmService
      .getLeaves()
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe((records) => {
        this.dataSource.data = records;
        if (this.dataSource.paginator) {
          this.dataSource.paginator.firstPage();
        }
      });
  }
}
