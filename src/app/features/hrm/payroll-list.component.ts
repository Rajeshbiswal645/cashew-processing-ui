import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { PayrollRecord } from './hrm.models';
import { HrmService } from './hrm.service';

@Component({
  selector: 'app-payroll-list',
  templateUrl: './payroll-list.component.html',
  styleUrls: ['./payroll-list.component.scss']
})
export class PayrollListComponent {
  readonly displayedColumns = ['employeeName', 'month', 'basicSalary', 'deductions', 'netSalary', 'status', 'actions'];
  readonly months = this.hrmService.getAvailableMonths();

  rows: PayrollRecord[] = [];
  selectedMonth = '2026-04';
  isLoading = true;
  updatingPayrollId: string | null = null;

  constructor(
    private readonly hrmService: HrmService,
    private readonly router: Router,
    private readonly snackBar: MatSnackBar
  ) {
    this.loadPayroll();
  }

  markPaid(record: PayrollRecord): void {
    this.updatingPayrollId = record.id;
    this.hrmService
      .markPayrollPaid(record.id)
      .pipe(finalize(() => (this.updatingPayrollId = null)))
      .subscribe(() => {
        this.snackBar.open(`${record.employeeName} payroll marked as paid`, 'Close', { duration: 2200 });
        this.loadPayroll();
      });
  }

  openGenerate(): void {
    void this.router.navigate(['/payroll/generate'], { queryParams: { month: this.selectedMonth } });
  }

  openPayslip(record: PayrollRecord): void {
    void this.router.navigate(['/payroll', record.id]);
  }

  statusClass(status: PayrollRecord['status']): string {
    return status.toLowerCase();
  }

  loadPayroll(): void {
    this.isLoading = true;
    this.hrmService
      .getPayroll(this.selectedMonth)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe((rows) => {
        this.rows = rows;
      });
  }
}
