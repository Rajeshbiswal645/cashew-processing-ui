import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { finalize } from 'rxjs/operators';
import { Employee } from './hrm.models';
import { HrmService } from './hrm.service';

@Component({
  selector: 'app-payroll-generate',
  templateUrl: './payroll-generate.component.html',
  styleUrls: ['./payroll-generate.component.scss']
})
export class PayrollGenerateComponent {
  readonly months = this.hrmService.getAvailableMonths();
  employees: Employee[] = [];
  isSubmitting = false;

  readonly form = this.formBuilder.nonNullable.group({
    month: ['2026-04', Validators.required],
    employeeId: ['ALL', Validators.required]
  });

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly hrmService: HrmService,
    private readonly snackBar: MatSnackBar,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) {
    const month = this.route.snapshot.queryParamMap.get('month');
    if (month) {
      this.form.patchValue({ month });
    }

    this.hrmService.getEmployees().subscribe((employees) => {
      this.employees = employees.filter((employee) => employee.status === 'ACTIVE');
    });
  }

  generate(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }

    this.isSubmitting = true;
    this.hrmService
      .generatePayroll(this.form.getRawValue())
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe((records) => {
        this.snackBar.open(`${records.length} payroll record(s) generated successfully`, 'Close', { duration: 2400 });
        void this.router.navigate(['/payroll'], { queryParams: { month: this.form.controls.month.value } });
      });
  }
}
