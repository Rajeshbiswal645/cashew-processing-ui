import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { finalize } from 'rxjs/operators';
import { AttendanceRecord, AttendanceStatus } from './hrm.models';
import { HrmService } from './hrm.service';

@Component({
  selector: 'app-attendance',
  templateUrl: './attendance.component.html',
  styleUrls: ['./attendance.component.scss']
})
export class AttendanceComponent implements AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  readonly displayedColumns = ['employeeName', 'date', 'status', 'actions'];
  readonly dataSource = new MatTableDataSource<AttendanceRecord>([]);

  isLoading = true;
  updatingRecordId: string | null = null;

  constructor(
    private readonly hrmService: HrmService,
    private readonly snackBar: MatSnackBar
  ) {
    this.loadAttendance();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  get emptyState(): boolean {
    return !this.isLoading && this.dataSource.data.length === 0;
  }

  markStatus(record: AttendanceRecord, status: AttendanceStatus): void {
    this.updatingRecordId = record.id;
    this.hrmService
      .markAttendance(record.id, status)
      .pipe(finalize(() => (this.updatingRecordId = null)))
      .subscribe(() => {
        this.snackBar.open(`${record.employeeName} marked as ${status.toLowerCase()}`, 'Close', { duration: 2200 });
        this.loadAttendance();
      });
  }

  statusClass(status: AttendanceStatus): string {
    return status.toLowerCase();
  }

  private loadAttendance(): void {
    this.isLoading = true;
    this.hrmService
      .getAttendance()
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe((records) => {
        this.dataSource.data = records;
        if (this.dataSource.paginator) {
          this.dataSource.paginator.firstPage();
        }
      });
  }
}
