import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { finalize } from 'rxjs/operators';
import { DryingFormComponent } from './drying-form.component';
import { DryingBatch, DryingCandidate, DryingCompletePayload, DryingCreatePayload, DryingStatus } from './drying.models';
import { DryingService } from './drying.service';

@Component({
  selector: 'app-drying-list',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSidenavModule,
    MatSnackBarModule,
    MatTableModule,
    DryingFormComponent
  ],
  templateUrl: './drying-list.component.html',
  styleUrls: ['./drying-list.component.scss']
})
export class DryingListComponent {
  readonly displayedColumns = ['id', 'rcnId', 'vendor', 'weightBeforeDrying', 'moistureBefore', 'status', 'actions'];

  batches: DryingBatch[] = [];
  candidates: DryingCandidate[] = [];
  selectedBatch: DryingBatch | null = null;
  drawerMode: 'create' | 'complete' = 'create';
  isDrawerOpen = false;
  isLoading = true;
  isSaving = false;

  constructor(
    private readonly dryingService: DryingService,
    private readonly snackBar: MatSnackBar
  ) {
    this.loadData();
  }

  openCreateDrawer(): void {
    this.selectedBatch = null;
    this.drawerMode = 'create';
    this.isDrawerOpen = true;
  }

  openCompleteDrawer(batch: DryingBatch): void {
    this.selectedBatch = batch;
    this.drawerMode = 'complete';
    this.isDrawerOpen = true;
  }

  closeDrawer(): void {
    this.isDrawerOpen = false;
    this.selectedBatch = null;
  }

  createBatch(payload: DryingCreatePayload): void {
    this.isSaving = true;
    this.dryingService
      .createDryingBatch(payload)
      .pipe(finalize(() => (this.isSaving = false)))
      .subscribe((batch) => {
        this.closeDrawer();
        this.loadData();
        this.snackBar.open(`${batch.id} created for ${batch.rcnId}`, 'Close', { duration: 2600 });
      });
  }

  completeBatch(payload: DryingCompletePayload): void {
    if (!this.selectedBatch) {
      return;
    }

    this.isSaving = true;
    this.dryingService
      .completeDryingBatch(this.selectedBatch.id, payload)
      .pipe(finalize(() => (this.isSaving = false)))
      .subscribe((batch) => {
        this.closeDrawer();
        this.loadData();
        this.snackBar.open(`${batch.id} marked completed`, 'Close', { duration: 2600 });
      });
  }

  getStatusClass(status: DryingStatus): string {
    return status.toLowerCase().replace('_', '-');
  }

  getStatusLabel(status: DryingStatus): string {
    return status === 'IN_PROGRESS' ? 'In Progress' : 'Completed';
  }

  private loadData(): void {
    this.isLoading = true;
    this.dryingService
      .getDryingBatches()
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe((batches) => {
        this.batches = batches;
      });

    this.dryingService.getDryingCandidates().subscribe((candidates) => {
      this.candidates = candidates;
    });
  }
}
