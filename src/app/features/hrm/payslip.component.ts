import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { PayslipDetail } from './hrm.models';
import { HrmService } from './hrm.service';

@Component({
  selector: 'app-payslip',
  templateUrl: './payslip.component.html',
  styleUrls: ['./payslip.component.scss']
})
export class PayslipComponent {
  detail: PayslipDetail | undefined;
  isLoading = true;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly hrmService: HrmService
  ) {
    this.route.paramMap.subscribe((params) => {
      const payrollId = params.get('id');
      if (!payrollId) {
        this.isLoading = false;
        return;
      }

      this.loadPayslip(payrollId);
    });
  }

  private loadPayslip(payrollId: string): void {
    this.isLoading = true;
    this.hrmService
      .getPayslip(payrollId)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe((detail) => {
        this.detail = detail;
      });
  }
}
