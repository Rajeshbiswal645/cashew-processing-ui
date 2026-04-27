import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { finalize } from 'rxjs/operators';
import { RcnBatch, RcnBatchFormValue, RcnStatus, RcnVendor } from './rcn.models';
import { RcnDrawerComponent } from './rcn-drawer.component';
import { RcnService } from './rcn.service';

@Component({
  selector: 'app-rcn-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatPaginatorModule,
    MatSelectModule,
    MatSidenavModule,
    MatSnackBarModule,
    MatSortModule,
    MatTableModule,
    RcnDrawerComponent
  ],
  templateUrl: './rcn-list.component.html',
  styleUrls: ['./rcn-list.component.scss']
})
export class RcnListComponent implements AfterViewInit {
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  readonly displayedColumns = [
    'id',
    'vendorName',
    'origin',
    'truckId',
    'netWeight',
    'moistureBefore',
    'status',
    'actions'
  ];

  readonly statusOptions: Array<'All' | RcnStatus> = ['All', 'Pending QC', 'Approved', 'Rejected'];
  readonly filtersForm = this.formBuilder.group({
    search: [''],
    status: ['All' as 'All' | RcnStatus],
    procurementDate: [null as Date | null]
  });

  readonly dataSource = new MatTableDataSource<RcnBatch>([]);
  vendors: RcnVendor[] = [];
  selectedBatch: RcnBatch | null = null;
  isDrawerOpen = false;
  isSaving = false;
  isLoading = false;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly snackBar: MatSnackBar,
    private readonly rcnService: RcnService
  ) {
    this.dataSource.filterPredicate = (batch, filterValue) => {
      const filter = JSON.parse(filterValue) as {
        search: string;
        status: string;
        procurementDate: string | null;
      };

      const matchesSearch =
        !filter.search ||
        [batch.id, batch.vendorName, batch.origin, batch.truckId].join(' ').toLowerCase().includes(filter.search);
      const matchesStatus = filter.status === 'All' || batch.status === filter.status;
      const matchesDate = !filter.procurementDate || batch.procurementDate === filter.procurementDate;

      return matchesSearch && matchesStatus && matchesDate;
    };

    this.filtersForm.valueChanges.subscribe(() => this.loadBatches());
    this.loadData();
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  get emptyState(): boolean {
    return this.dataSource.data.length === 0;
  }

  openCreateDrawer(): void {
    this.selectedBatch = null;
    this.isDrawerOpen = true;
  }

  closeDrawer(): void {
    this.isDrawerOpen = false;
    this.selectedBatch = null;
  }

  editBatch(batch: RcnBatch): void {
    this.selectedBatch = batch;
    this.isDrawerOpen = true;
  }

  viewBatch(batch: RcnBatch): void {
    this.selectedBatch = batch;
    this.isDrawerOpen = true;
  }

  deleteBatch(batch: RcnBatch): void {
    const confirmed = window.confirm(`Delete ${batch.id}?`);
    if (!confirmed) {
      return;
    }

    this.rcnService.deleteBatch(batch.id).subscribe(() => {
      this.loadBatches();
      this.snackBar.open('RCN batch deleted', 'Close', { duration: 2500 });
    });
  }

  saveBatch(payload: RcnBatchFormValue): void {
    this.isSaving = true;
    const request$ = payload.id
      ? this.rcnService.updateBatch(payload.id, payload)
      : this.rcnService.createBatch(payload);

    request$
      .pipe(finalize(() => (this.isSaving = false)))
      .subscribe((batch: RcnBatch) => {
        const exists = this.dataSource.data.some((entry) => entry.id === batch.id);
        this.loadBatches();
        this.closeDrawer();
        this.snackBar.open(`RCN batch ${exists ? 'updated' : 'saved'} successfully`, 'Close', { duration: 2500 });
      });
  }

  getStatusClass(status: RcnStatus): string {
    return status.toLowerCase().replace(/\s+/g, '-');
  }

  private loadData(): void {
    this.rcnService.getVendors().subscribe((vendors) => {
      this.vendors = vendors;
    });

    this.loadBatches();
  }

  private loadBatches(): void {
    const value = this.filtersForm.getRawValue();
    this.isLoading = true;
    this.rcnService
      .getBatches({
        search: (value.search ?? '').trim(),
        status: value.status ?? 'All',
        procurementDate: value.procurementDate ? new Date(value.procurementDate).toISOString().slice(0, 10) : null
      })
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe((batches) => {
        this.dataSource.data = batches;
        if (this.dataSource.paginator) {
          this.dataSource.paginator.firstPage();
        }
      });
  }
}
