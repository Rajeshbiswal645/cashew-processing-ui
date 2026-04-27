import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { finalize } from 'rxjs/operators';
import { QcInspectionDrawerComponent } from './qc-inspection-drawer.component';
import { QcBatch, QcFilters, QcInspectionPayload, QcStatus } from './qc.models';
import { QcService } from './qc.service';

@Component({
  selector: 'app-qc-list',
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
    MatProgressSpinnerModule,
    MatSelectModule,
    MatSidenavModule,
    MatSnackBarModule,
    MatSortModule,
    MatTableModule,
    QcInspectionDrawerComponent
  ],
  templateUrl: './qc-list.component.html',
  styleUrls: ['./qc-list.component.scss']
})
export class QcListComponent implements AfterViewInit {
  @ViewChild(MatSort) sort!: MatSort;

  readonly displayedColumns = ['id', 'vendor', 'origin', 'netWeight', 'moistureBefore', 'status', 'actions'];

  readonly statusOptions: Array<{ value: QcFilters['status']; label: string }> = [
    { value: 'ALL', label: 'All' },
    { value: 'PENDING', label: 'Pending QC' },
    { value: 'PASSED', label: 'Passed' },
    { value: 'FAILED', label: 'Failed' }
  ];

  readonly filtersForm = this.formBuilder.group({
    search: [''],
    status: ['ALL' as QcFilters['status']],
    date: [null as Date | null]
  });

  readonly dataSource = new MatTableDataSource<QcBatch>([]);

  selectedBatch: QcBatch | null = null;
  isDrawerOpen = false;
  isReadOnly = false;
  isLoading = true;
  isSaving = false;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly qcService: QcService,
    private readonly snackBar: MatSnackBar
  ) {
    this.filtersForm.valueChanges.subscribe(() => this.loadBatches());
    this.loadBatches();
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
  }

  get emptyState(): boolean {
    return !this.isLoading && this.dataSource.data.length === 0;
  }

  openInspect(batch: QcBatch): void {
    this.selectedBatch = batch;
    this.isReadOnly = false;
    this.isDrawerOpen = true;
  }

  openView(batch: QcBatch): void {
    this.selectedBatch = batch;
    this.isReadOnly = true;
    this.isDrawerOpen = true;
  }

  closeDrawer(): void {
    this.isDrawerOpen = false;
    this.selectedBatch = null;
    this.isReadOnly = false;
  }

  saveInspection(payload: QcInspectionPayload): void {
    if (!this.selectedBatch) {
      return;
    }

    this.isSaving = true;
    this.qcService
      .inspectBatch(this.selectedBatch.id, payload)
      .pipe(finalize(() => (this.isSaving = false)))
      .subscribe((batch) => {
        this.closeDrawer();
        this.loadBatches();
        const message =
          batch.status === 'DRYING_REQUIRED'
            ? `${batch.id} approved and moved to drying`
            : batch.status === 'PASSED'
              ? `${batch.id} passed QC`
              : `${batch.id} rejected`;
        this.snackBar.open(message, 'Close', { duration: 2600 });
      });
  }

  getStatusLabel(status: QcStatus): string {
    return ({ PENDING: 'Pending', PASSED: 'Passed', FAILED: 'Failed', DRYING_REQUIRED: 'Drying Required' } as Record<
      QcStatus,
      string
    >)[status];
  }

  getStatusClass(status: QcStatus): string {
    return status.toLowerCase().replace('_', '-');
  }

  private loadBatches(): void {
    this.isLoading = true;
    this.qcService
      .getBatches(this.getFilters())
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe((batches) => {
        this.dataSource.data = batches;
      });
  }

  private getFilters(): QcFilters {
    const raw = this.filtersForm.getRawValue();

    return {
      search: raw.search?.trim() ?? '',
      status: raw.status ?? 'ALL',
      date: raw.date ? new Date(raw.date).toISOString().slice(0, 10) : null
    };
  }
}
