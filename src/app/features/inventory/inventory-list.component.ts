import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { finalize } from 'rxjs/operators';
import { BatchTraceDrawerComponent } from './batch-trace-drawer.component';
import { InventoryFilterComponent } from './inventory-filter.component';
import {
  BatchTraceStep,
  InventoryFilters,
  InventoryLedgerEntry,
  InventoryRecord,
  InventoryStatus,
  InventoryTab,
  InventoryViewMode
} from './inventory.models';
import { InventoryService } from './inventory.service';

@Component({
  selector: 'app-inventory-list',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatSidenavModule,
    MatSnackBarModule,
    MatSortModule,
    MatTableModule,
    MatTabsModule,
    InventoryFilterComponent,
    BatchTraceDrawerComponent
  ],
  templateUrl: './inventory-list.component.html',
  styleUrls: ['./inventory-list.component.scss']
})
export class InventoryListComponent implements AfterViewInit {
  @ViewChild('summarySort') summarySort!: MatSort;
  @ViewChild('ledgerSort') ledgerSort!: MatSort;
  @ViewChild('summaryPaginator') summaryPaginator!: MatPaginator;
  @ViewChild('ledgerPaginator') ledgerPaginator!: MatPaginator;

  readonly stockTabs: Array<{ label: string; value: InventoryTab }> = [
    { label: 'RCN Stock', value: 'RCN_STOCK' },
    { label: 'Kernel Stock', value: 'KERNEL_STOCK' },
    { label: 'Finished Goods', value: 'FINISHED_GOODS' },
    { label: 'Byproducts', value: 'BYPRODUCTS' }
  ];

  readonly summaryColumns = ['batchId', 'stage', 'category', 'quantity', 'location', 'status', 'actions'];
  readonly ledgerColumns = ['date', 'batchId', 'stage', 'movementType', 'quantity', 'reference'];

  readonly summaryDataSource = new MatTableDataSource<InventoryRecord>([]);
  readonly ledgerDataSource = new MatTableDataSource<InventoryLedgerEntry>([]);

  activeTab: InventoryTab = 'RCN_STOCK';
  viewMode: InventoryViewMode = 'SUMMARY';
  baseFilters: Omit<InventoryFilters, 'tab'> = {
    stage: 'ALL',
    category: 'ALL',
    startDate: null,
    endDate: null,
    search: ''
  };

  selectedBatchId = '';
  traceSteps: BatchTraceStep[] = [];
  traceLoading = false;
  isDrawerOpen = false;
  isLoading = true;

  constructor(
    private readonly inventoryService: InventoryService,
    private readonly snackBar: MatSnackBar
  ) {
    this.loadData();
  }

  ngAfterViewInit(): void {
    this.summaryDataSource.sort = this.summarySort;
    this.ledgerDataSource.sort = this.ledgerSort;
    this.summaryDataSource.paginator = this.summaryPaginator;
    this.ledgerDataSource.paginator = this.ledgerPaginator;
  }

  get filters(): InventoryFilters {
    return {
      ...this.baseFilters,
      tab: this.activeTab
    };
  }

  get emptyState(): boolean {
    const dataLength = this.viewMode === 'SUMMARY' ? this.summaryDataSource.data.length : this.ledgerDataSource.data.length;
    return !this.isLoading && dataLength === 0;
  }

  onFiltersChange(filters: Omit<InventoryFilters, 'tab'>): void {
    this.baseFilters = filters;
    this.loadData();
  }

  onViewModeChange(mode: InventoryViewMode): void {
    this.viewMode = mode;
  }

  onTabChange(index: number): void {
    this.activeTab = this.stockTabs[index]?.value ?? 'RCN_STOCK';
    this.loadData();
  }

  viewDetails(row: InventoryRecord): void {
    this.selectedBatchId = row.batchId;
    this.snackBar.open(`Viewing inventory details for ${row.batchId}`, 'Close', { duration: 2200 });
  }

  traceBatch(row: InventoryRecord): void {
    this.selectedBatchId = row.batchId;
    this.traceLoading = true;
    this.isDrawerOpen = true;
    this.inventoryService
      .getBatchTrace(row.batchId)
      .pipe(finalize(() => (this.traceLoading = false)))
      .subscribe((steps) => {
        this.traceSteps = steps;
        this.snackBar.open(`Trace loaded for ${row.batchId}`, 'Close', { duration: 2200 });
      });
  }

  closeDrawer(): void {
    this.isDrawerOpen = false;
    this.traceSteps = [];
  }

  getStatusClass(status: InventoryStatus): string {
    return status.toLowerCase();
  }

  private loadData(): void {
    this.isLoading = true;

    this.inventoryService.getInventory(this.filters).subscribe((records) => {
      this.summaryDataSource.data = records;
      if (this.summaryDataSource.paginator) {
        this.summaryDataSource.paginator.firstPage();
      }
    });

    this.inventoryService
      .getLedger(this.filters)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe((entries) => {
        this.ledgerDataSource.data = entries;
        if (this.ledgerDataSource.paginator) {
          this.ledgerDataSource.paginator.firstPage();
        }
      });
  }
}
