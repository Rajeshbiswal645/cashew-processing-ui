import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { finalize, switchMap } from 'rxjs/operators';
import { BoilingFormComponent } from './boiling-form.component';
import { CuttingFormComponent } from './cutting-form.component';
import {
  BoilingPayload,
  CuttingPayload,
  ProcessStepSummary,
  ProcessingDetail,
  StepFlowKey
} from './processing.models';
import { ProcessingService } from './processing.service';

@Component({
  selector: 'app-processing-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    BoilingFormComponent,
    CuttingFormComponent
  ],
  templateUrl: './processing-detail.component.html',
  styleUrls: ['./processing-detail.component.scss']
})
export class ProcessingDetailComponent {
  process: ProcessingDetail | null = null;
  isLoading = true;
  isSavingBoiling = false;
  isSavingCutting = false;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly processingService: ProcessingService,
    private readonly snackBar: MatSnackBar
  ) {
    this.route.paramMap
      .pipe(switchMap((params) => this.processingService.getProcessById(params.get('id') ?? '')))
      .subscribe((process) => {
        this.process = process ?? null;
        this.isLoading = false;

        if (!process) {
          this.snackBar.open('Processing batch not found.', 'Close', { duration: 2600 });
          void this.router.navigate(['/processing']);
        }
      });
  }

  get steps(): ProcessStepSummary[] {
    if (!this.process) {
      return [];
    }

    return [
      this.createStep('RCN', 'RCN'),
      this.createStep('BOILING', 'Boiling'),
      this.createStep('CUTTING', 'Cutting'),
      this.createStep('COMPLETED', 'Completed')
    ];
  }

  get yieldPercentage(): number {
    const inputWeight = Number(this.process?.cutting.inputWeight ?? 0);
    const kernelWeight = Number(this.process?.cutting.kernelWeight ?? 0);

    if (!inputWeight) {
      return 0;
    }

    return Number(((kernelWeight / inputWeight) * 100).toFixed(1));
  }

  get lossPercentage(): number {
    const inputWeight = Number(this.process?.cutting.inputWeight ?? 0);
    const totalOutput =
      Number(this.process?.cutting.kernelWeight ?? 0) +
      Number(this.process?.cutting.shellWeight ?? 0) +
      Number(this.process?.cutting.uncutWeight ?? 0);

    if (!inputWeight) {
      return 0;
    }

    return Number((((inputWeight - totalOutput) / inputWeight) * 100).toFixed(1));
  }

  saveBoilingStart(payload: BoilingPayload): void {
    if (!this.process) {
      return;
    }

    this.isSavingBoiling = true;
    this.processingService
      .startBoiling(this.process.id, payload)
      .pipe(finalize(() => (this.isSavingBoiling = false)))
      .subscribe({
        next: () => {
          this.refresh();
          this.snackBar.open('Boiling started successfully.', 'Close', { duration: 2400 });
        },
        error: (error: Error) => {
          this.snackBar.open(error.message, 'Close', { duration: 2600 });
        }
      });
  }

  saveBoilingComplete(payload: BoilingPayload): void {
    if (!this.process) {
      return;
    }

    this.isSavingBoiling = true;
    this.processingService
      .completeBoiling(this.process.id, payload)
      .pipe(finalize(() => (this.isSavingBoiling = false)))
      .subscribe({
        next: () => {
          this.refresh();
          this.snackBar.open('Boiling completed. Cutting is now unlocked.', 'Close', { duration: 2600 });
        },
        error: (error: Error) => {
          this.snackBar.open(error.message, 'Close', { duration: 2600 });
        }
      });
  }

  saveCuttingStart(payload: CuttingPayload): void {
    if (!this.process) {
      return;
    }

    this.isSavingCutting = true;
    this.processingService
      .startCutting(this.process.id, payload)
      .pipe(finalize(() => (this.isSavingCutting = false)))
      .subscribe({
        next: () => {
          this.refresh();
          this.snackBar.open('Cutting started successfully.', 'Close', { duration: 2400 });
        },
        error: (error: Error) => {
          this.snackBar.open(error.message, 'Close', { duration: 2600 });
        }
      });
  }

  saveCuttingComplete(payload: CuttingPayload): void {
    if (!this.process) {
      return;
    }

    this.isSavingCutting = true;
    this.processingService
      .completeCutting(this.process.id, payload)
      .pipe(finalize(() => (this.isSavingCutting = false)))
      .subscribe({
        next: () => {
          this.refresh();
          this.snackBar.open('Cutting completed. Process marked as completed.', 'Close', { duration: 2600 });
        },
        error: (error: Error) => {
          this.snackBar.open(error.message, 'Close', { duration: 2600 });
        }
      });
  }

  private refresh(): void {
    if (!this.process) {
      return;
    }

    this.processingService.getProcessById(this.process.id).subscribe((process) => {
      this.process = process ?? null;
    });
  }

  private createStep(key: StepFlowKey, label: string): ProcessStepSummary {
    if (!this.process) {
      return { key, label, status: 'PENDING', current: false };
    }

    const currentStep = this.process.currentStage;
    const statusMap: Record<StepFlowKey, ProcessStepSummary['status']> = {
      RCN: 'COMPLETED',
      BOILING: this.process.boiling.status === 'COMPLETED'
        ? 'COMPLETED'
        : currentStep === 'BOILING'
          ? 'ACTIVE'
          : 'PENDING',
      CUTTING: this.process.cutting.status === 'COMPLETED'
        ? 'COMPLETED'
        : currentStep === 'CUTTING'
          ? 'ACTIVE'
          : 'PENDING',
      COMPLETED: this.process.status === 'COMPLETED' ? 'COMPLETED' : 'PENDING'
    };

    return {
      key,
      label,
      status: statusMap[key],
      current: (key === 'BOILING' && currentStep === 'BOILING') || (key === 'CUTTING' && currentStep === 'CUTTING')
    };
  }
}
