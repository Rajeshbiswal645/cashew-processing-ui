import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { finalize, switchMap } from 'rxjs/operators';
import { DispatchPayload, SalesOrderDetail, SalesOrderStatus } from './sales.models';
import { SalesService } from './sales.service';

@Component({
  selector: 'app-dispatch',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './dispatch.component.html',
  styleUrls: ['./dispatch.component.scss']
})
export class DispatchComponent {
  order: SalesOrderDetail | null = null;
  isLoading = true;
  isSaving = false;

  readonly form = this.formBuilder.group({
    truckId: ['', Validators.required],
    driverName: ['', Validators.required],
    driverPhone: ['', [Validators.required, Validators.minLength(10)]],
    actualWeight: [null as number | null, [Validators.required, Validators.min(1)]],
    dispatchDate: ['', Validators.required]
  });

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly formBuilder: FormBuilder,
    private readonly salesService: SalesService,
    private readonly snackBar: MatSnackBar
  ) {
    this.route.paramMap
      .pipe(switchMap((params) => this.salesService.getOrderById(params.get('id') ?? '')))
      .subscribe((order) => {
        this.order = order ?? null;
        this.isLoading = false;

        if (!order) {
          this.snackBar.open('Sales order not found.', 'Close', { duration: 2400 });
          void this.router.navigate(['/sales']);
          return;
        }

        this.patchForm(order);
      });
  }

  get canDispatch(): boolean {
    return !!this.order && this.order.status === 'ALLOCATED' && !this.isSaving && this.form.valid;
  }

  get statusLabel(): string {
    return this.order ? this.getStatusLabel(this.order.status) : '';
  }

  getStatusClass(status: SalesOrderStatus): string {
    return status.toLowerCase();
  }

  getStatusLabel(status: SalesOrderStatus): string {
    return status === 'PENDING'
      ? 'Pending'
      : status === 'ALLOCATED'
        ? 'Allocated'
        : status === 'DISPATCHED'
          ? 'Dispatched'
          : 'Completed';
  }

  submit(): void {
    this.form.markAllAsTouched();
    if (!this.order || this.form.invalid) {
      return;
    }

    const actualWeight = Number(this.form.controls.actualWeight.value ?? 0);
    if (actualWeight > this.order.allocatedQuantity) {
      this.snackBar.open('Actual weight cannot exceed allocated quantity.', 'Close', { duration: 2600 });
      return;
    }

    const raw = this.form.getRawValue();
    const payload: DispatchPayload = {
      truckId: (raw.truckId ?? '').trim(),
      driverName: (raw.driverName ?? '').trim(),
      driverPhone: (raw.driverPhone ?? '').trim(),
      destination: this.order.destination,
      actualWeight,
      dispatchDate: raw.dispatchDate ?? ''
    };

    this.isSaving = true;
    this.salesService
      .dispatchOrder(this.order.id, payload)
      .pipe(finalize(() => (this.isSaving = false)))
      .subscribe({
        next: () => {
          this.snackBar.open('Dispatch confirmed and inventory deducted.', 'Close', { duration: 2400 });
          void this.router.navigate(['/sales', this.order?.id]);
        },
        error: (error: Error) => {
          this.snackBar.open(error.message, 'Close', { duration: 2600 });
        }
      });
  }

  private patchForm(order: SalesOrderDetail): void {
    this.form.patchValue({
      truckId: order.dispatch?.truckId ?? '',
      driverName: order.dispatch?.driverName ?? '',
      driverPhone: order.dispatch?.driverPhone ?? '',
      actualWeight: order.dispatch?.actualWeight ?? order.allocatedQuantity,
      dispatchDate: order.dispatch?.dispatchDate ?? new Date().toISOString().slice(0, 10)
    });

    if (order.status === 'DISPATCHED' || order.status === 'COMPLETED') {
      this.form.disable({ emitEvent: false });
    } else {
      this.form.enable({ emitEvent: false });
    }
  }
}
