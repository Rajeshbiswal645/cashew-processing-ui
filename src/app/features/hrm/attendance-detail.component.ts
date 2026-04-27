import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { EmployeeAttendanceDetail } from './hrm.models';
import { HrmService } from './hrm.service';

@Component({
  selector: 'app-attendance-detail',
  templateUrl: './attendance-detail.component.html',
  styleUrls: ['./attendance-detail.component.scss']
})
export class AttendanceDetailComponent {
  detail: EmployeeAttendanceDetail | undefined;
  month = '2026-04';
  isLoading = true;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly hrmService: HrmService
  ) {
    this.route.paramMap.subscribe((params) => {
      const employeeId = params.get('id');
      this.month = this.route.snapshot.queryParamMap.get('month') ?? '2026-04';

      if (!employeeId) {
        this.isLoading = false;
        return;
      }

      this.loadDetail(employeeId, this.month);
    });
  }

  statusLabel(status: string): string {
    return status === 'HALF_DAY' ? 'H' : status.charAt(0);
  }

  statusClass(status: string): string {
    return status.toLowerCase();
  }

  private loadDetail(employeeId: string, month: string): void {
    this.isLoading = true;
    this.hrmService
      .getEmployeeAttendanceDetail(employeeId, month)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe((detail) => {
        this.detail = detail;
      });
  }
}
