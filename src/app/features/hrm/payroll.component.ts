import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { finalize } from 'rxjs/operators';
import { PayrollRecord } from './hrm.models';
import { HrmService } from './hrm.service';

@Component({
  selector: 'app-payroll',
  templateUrl: './payroll.component.html',
  styleUrls: ['./payroll.component.scss']
})
export class PayrollComponent implements AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  readonly displayedColumns = ['employeeName', 'basicSalary', 'deductions', 'netSalary'];
  readonly dataSource = new MatTableDataSource<PayrollRecord>([]);

  isLoading = true;

  constructor(private readonly hrmService: HrmService) {
    this.loadPayroll();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  get emptyState(): boolean {
    return !this.isLoading && this.dataSource.data.length === 0;
  }

  private loadPayroll(): void {
    this.isLoading = true;
    this.hrmService
      .getPayroll()
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe((records) => {
        this.dataSource.data = records;
        if (this.dataSource.paginator) {
          this.dataSource.paginator.firstPage();
        }
      });
  }
}
