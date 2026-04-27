import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { finalize, switchMap } from 'rxjs/operators';
import { AllocationInput, FinishedGoodsStock, SalesOrderDetail, SalesOrderStatus } from './sales.models';
import { SalesService } from './sales.service';

@Component({
  selector: 'app-sales-detail',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './sales-detail.component.html',
  styleUrls: ['./sales-detail.component.scss']
})
export class SalesDetailComponent {
  order: SalesOrderDetail | null = null;
  isLoading = true;
  isAllocating = false;
  isCompleting = false;

  readonly allocationForm = this.formBuilder.group({});

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

        this.buildAllocationForm(order.stockOptions, order.allocations);
      });
  }

  get totalAvailable(): number {
    return (this.order?.stockOptions ?? []).reduce((sum, item) => sum + this.getFreeQty(item), 0);
  }

  get totalAllocatedInput(): number {
    return (this.order?.stockOptions ?? []).reduce((sum, item) => sum + Number(this.allocationForm.get(item.batchId)?.value ?? 0), 0);
  }

  get canAllocate(): boolean {
    return !!this.order && (this.order.status === 'PENDING' || this.order.status === 'ALLOCATED') && !this.isAllocating;
  }

  get canComplete(): boolean {
    return !!this.order && this.order.status === 'DISPATCHED' && !this.isCompleting;
  }

  get canOpenDispatch(): boolean {
    return !!this.order && this.order.status === 'ALLOCATED';
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

  getStatusClass(status: SalesOrderStatus): string {
    return status.toLowerCase();
  }

  getFreeQty(stock: FinishedGoodsStock): number {
    const existingAllocation = this.order?.allocations.find((entry) => entry.batchId === stock.batchId)?.allocateQty ?? 0;
    return stock.availableQty - stock.reservedQty + existingAllocation;
  }

  allocateStock(): void {
    if (!this.order) {
      return;
    }

    const allocations: AllocationInput[] = (this.order.stockOptions ?? []).map((stock) => ({
      batchId: stock.batchId,
      allocateQty: Number(this.allocationForm.get(stock.batchId)?.value ?? 0)
    }));

    const invalid = allocations.some((entry) => {
      const stock = this.order?.stockOptions.find((item) => item.batchId === entry.batchId);
      return !!stock && entry.allocateQty > this.getFreeQty(stock);
    });

    if (invalid) {
      this.snackBar.open('Allocate quantity cannot exceed available stock.', 'Close', { duration: 2600 });
      return;
    }

    this.isAllocating = true;
    this.salesService
      .allocateStock(this.order.id, allocations)
      .pipe(finalize(() => (this.isAllocating = false)))
      .subscribe({
        next: () => {
          this.refresh();
          this.snackBar.open('Stock allocated successfully.', 'Close', { duration: 2400 });
        },
        error: (error: Error) => {
          this.snackBar.open(error.message, 'Close', { duration: 2600 });
        }
      });
  }

  completeOrder(): void {
    if (!this.order) {
      return;
    }

    this.isCompleting = true;
    this.salesService
      .completeOrder(this.order.id)
      .pipe(finalize(() => (this.isCompleting = false)))
      .subscribe(() => {
        this.refresh();
        this.snackBar.open('Sales order marked as completed.', 'Close', { duration: 2400 });
      });
  }

  openDispatch(): void {
    if (!this.order) {
      return;
    }

    void this.router.navigate(['/sales', this.order.id, 'dispatch']);
  }

  private refresh(): void {
    if (!this.order) {
      return;
    }

    this.salesService.getOrderById(this.order.id).subscribe((order) => {
      this.order = order ?? null;
      if (order) {
        this.buildAllocationForm(order.stockOptions, order.allocations);
      }
    });
  }

  private buildAllocationForm(stockOptions: FinishedGoodsStock[], allocations: SalesOrderDetail['allocations']): void {
    Object.keys(this.allocationForm.controls).forEach((key) => {
      this.allocationForm.removeControl(key);
    });

    stockOptions.forEach((stock) => {
      const existing = allocations.find((entry) => entry.batchId === stock.batchId)?.allocateQty ?? 0;
      this.allocationForm.addControl(stock.batchId, this.formBuilder.control(existing, [Validators.min(0)]));
    });
  }
}
