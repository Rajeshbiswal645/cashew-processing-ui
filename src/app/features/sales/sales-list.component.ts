import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { finalize } from 'rxjs/operators';
import { Buyer, SalesOrder, SalesOrderFormValue, SalesOrderStatus } from './sales.models';
import { SalesFormComponent } from './sales-form.component';
import { SalesService } from './sales.service';

@Component({
  selector: 'app-sales-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatSidenavModule,
    MatSnackBarModule,
    MatSortModule,
    MatTableModule,
    SalesFormComponent
  ],
  templateUrl: './sales-list.component.html',
  styleUrls: ['./sales-list.component.scss']
})
export class SalesListComponent implements AfterViewInit {
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  readonly displayedColumns = ['id', 'buyerName', 'orderDate', 'quantity', 'status', 'actions'];
  readonly statusOptions: Array<'ALL' | SalesOrderStatus> = ['ALL', 'PENDING', 'ALLOCATED', 'DISPATCHED', 'COMPLETED'];
  readonly filtersForm = this.formBuilder.group({
    search: [''],
    status: ['ALL' as 'ALL' | SalesOrderStatus],
    orderDate: [null as Date | null]
  });

  readonly dataSource = new MatTableDataSource<SalesOrder>([]);

  buyers: Buyer[] = [];
  isLoading = true;
  isSaving = false;
  isDrawerOpen = false;
  selectedOrder: SalesOrder | null = null;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly router: Router,
    private readonly salesService: SalesService,
    private readonly snackBar: MatSnackBar
  ) {
    this.dataSource.filterPredicate = (order, filterValue) => {
      const filter = JSON.parse(filterValue) as { search: string; status: string; orderDate: string | null };
      const matchesSearch =
        !filter.search ||
        [order.id, order.buyerName, order.productCategory].join(' ').toLowerCase().includes(filter.search);
      const matchesStatus = filter.status === 'ALL' || order.status === filter.status;
      const matchesDate = !filter.orderDate || order.orderDate === filter.orderDate;
      return matchesSearch && matchesStatus && matchesDate;
    };

    this.filtersForm.valueChanges.subscribe(() => this.applyFilters());
    this.loadData();
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  get emptyState(): boolean {
    return !this.isLoading && this.dataSource.filteredData.length === 0;
  }

  openCreateDrawer(): void {
    this.selectedOrder = null;
    this.isDrawerOpen = true;
  }

  editOrder(order: SalesOrder): void {
    this.selectedOrder = order;
    this.isDrawerOpen = true;
  }

  closeDrawer(): void {
    this.selectedOrder = null;
    this.isDrawerOpen = false;
  }

  viewOrder(order: SalesOrder): void {
    void this.router.navigate(['/sales', order.id]);
  }

  allocateOrder(order: SalesOrder): void {
    void this.router.navigate(['/sales', order.id], { fragment: 'allocation' });
  }

  dispatchOrder(order: SalesOrder): void {
    void this.router.navigate(['/sales', order.id, 'dispatch']);
  }

  saveOrder(payload: SalesOrderFormValue): void {
    this.isSaving = true;
    const request$ = payload.id
      ? this.salesService.updateOrder(payload.id, payload)
      : this.salesService.createOrder(payload);

    request$
      .pipe(finalize(() => (this.isSaving = false)))
      .subscribe({
        next: (order) => {
          this.closeDrawer();
          this.snackBar.open(`Sales order ${order.id} saved successfully.`, 'Close', { duration: 2400 });
          this.loadOrders();
        },
        error: (error: Error) => {
          this.snackBar.open(error.message, 'Close', { duration: 2600 });
        }
      });
  }

  canAllocate(order: SalesOrder): boolean {
    return order.status === 'PENDING' || order.status === 'ALLOCATED';
  }

  canDispatch(order: SalesOrder): boolean {
    return order.status === 'ALLOCATED';
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

  getFilterLabel(status: 'ALL' | SalesOrderStatus): string {
    return status === 'ALL' ? 'All' : this.getStatusLabel(status);
  }

  private loadData(): void {
    this.salesService.getBuyers().subscribe((buyers) => {
      this.buyers = buyers;
    });

    this.loadOrders();
  }

  private loadOrders(): void {
    this.isLoading = true;
    this.salesService
      .getOrders()
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe((orders) => {
        this.dataSource.data = orders;
        this.applyFilters();
      });
  }

  private applyFilters(): void {
    const raw = this.filtersForm.getRawValue();
    this.dataSource.filter = JSON.stringify({
      search: (raw.search ?? '').trim().toLowerCase(),
      status: raw.status ?? 'ALL',
      orderDate: raw.orderDate ? new Date(raw.orderDate).toISOString().slice(0, 10) : null
    });

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}
