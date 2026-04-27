import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { finalize, take } from 'rxjs/operators';
import { ProcessingRecord, ProcessingStage, ProcessingStatus } from './processing.models';
import { ProcessingService } from './processing.service';

type PipelineStageKey = 'RCN' | 'BOILING' | 'CUTTING' | 'DRYING' | 'PACKING';
type PipelineDisplayStatus = 'PENDING' | 'RUNNING' | 'COMPLETED';

interface PipelineJobView {
  processId: string;
  process: ProcessingRecord;
  stageKey: PipelineStageKey;
  machineOrOperator: string;
  inputWeight: number | null;
  outputWeight: number | null;
  status: ProcessingStatus;
}

interface PipelineStageView {
  key: PipelineStageKey;
  label: string;
  status: PipelineDisplayStatus;
  batchCount: number;
  jobs: PipelineJobView[];
}

@Component({
  selector: 'app-processing-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './processing-list.component.html',
  styleUrls: ['./processing-list.component.scss']
})
export class ProcessingListComponent {
  readonly stageOrder: PipelineStageKey[] = ['RCN', 'BOILING', 'CUTTING', 'DRYING', 'PACKING'];
  readonly stageLabels: Record<PipelineStageKey, string> = {
    RCN: 'RCN',
    BOILING: 'BOILING',
    CUTTING: 'CUTTING',
    DRYING: 'DRYING',
    PACKING: 'PACKING'
  };

  processes: ProcessingRecord[] = [];
  pipelineStages: PipelineStageView[] = [];
  expandedStage: PipelineStageKey | null = null;

  isLoading = true;
  startingProcessId: string | null = null;

  constructor(
    private readonly processingService: ProcessingService,
    private readonly snackBar: MatSnackBar,
    private readonly router: Router
  ) {
    this.loadProcesses();
  }

  get emptyState(): boolean {
    return !this.isLoading && this.processes.length === 0;
  }

  get activeStageKey(): PipelineStageKey | null {
    const runningStage = this.pipelineStages.find((stage) => stage.status === 'RUNNING');

    if (runningStage) {
      return runningStage.key;
    }

    const pendingStageWithJobs = this.pipelineStages.find((stage) => stage.status === 'PENDING' && stage.batchCount > 0);
    if (pendingStageWithJobs) {
      return pendingStageWithJobs.key;
    }

    const completedStage = this.pipelineStages.find((stage) => stage.status === 'COMPLETED');
    return completedStage ? completedStage.key : null;
  }

  viewProcess(process: ProcessingRecord): void {
    void this.router.navigate(['/processing', process.id]);
  }

  startProcess(process: ProcessingRecord): void {
    this.startingProcessId = process.id;
    this.processingService
      .startCurrentStep(process.id)
      .pipe(finalize(() => (this.startingProcessId = null)))
      .subscribe({
        next: () => {
          this.snackBar.open(`${process.id} moved to ${this.getStageLabel(process.currentStage)}`, 'Close', {
            duration: 2400
          });
          void this.router.navigate(['/processing', process.id]);
        },
        error: (error: Error) => {
          this.snackBar.open(error.message, 'Close', { duration: 2600 });
        }
      });
  }

  canStart(process: ProcessingRecord): boolean {
    return process.status === 'PENDING' && process.currentStage !== 'COMPLETED';
  }

  getStageLabel(stage: ProcessingStage): string {
    return stage === 'COMPLETED' ? 'Completed' : stage.charAt(0) + stage.slice(1).toLowerCase();
  }

  getStatusLabel(status: ProcessingStatus): string {
    return status === 'IN_PROGRESS' ? 'In Progress' : status.charAt(0) + status.slice(1).toLowerCase();
  }

  getStageClass(stage: ProcessingStage): string {
    return stage.toLowerCase();
  }

  getStatusClass(status: ProcessingStatus): string {
    return status.toLowerCase().replace('_', '-');
  }

  getDisplayStatusLabel(status: PipelineDisplayStatus): string {
    switch (status) {
      case 'RUNNING':
        return 'Running';
      case 'COMPLETED':
        return 'Completed';
      default:
        return 'Pending';
    }
  }

  getDisplayStatusClass(status: PipelineDisplayStatus): string {
    return `pipeline-status ${status.toLowerCase()}`;
  }

  toggleStage(stage: PipelineStageView): void {
    if (stage.batchCount === 0) {
      return;
    }
    this.expandedStage = this.expandedStage === stage.key ? null : stage.key;
  }

  isExpanded(stage: PipelineStageView): boolean {
    return this.expandedStage === stage.key;
  }

  openJob(process: ProcessingRecord): void {
    this.viewProcess(process);
  }

  private loadProcesses(): void {
    this.isLoading = true;
    this.processingService
      .getProcesses()
      .pipe(take(1))
      .subscribe({
        next: (records) => {
          this.processes = records;
          this.pipelineStages = this.buildPipelineStages(records);
          if (!this.expandedStage || !this.pipelineStages.find((stage) => stage.key === this.expandedStage && stage.batchCount > 0)) {
            this.expandedStage = this.pipelineStages.find((stage) => stage.batchCount > 0)?.key ?? null;
          }
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
          this.pipelineStages = this.buildPipelineStages([]);
        }
      });
  }

  private buildPipelineStages(records: ProcessingRecord[]): PipelineStageView[] {
    return this.stageOrder.map((stageKey) => {
      const jobs =
        stageKey === 'DRYING' || stageKey === 'PACKING'
          ? []
          : records.map((record) => this.createJobView(record, stageKey));
      return {
        key: stageKey,
        label: this.stageLabels[stageKey],
        status: this.getPipelineStageStatus(stageKey, jobs),
        batchCount: jobs.length,
        jobs
      };
    });
  }

  private createJobView(record: ProcessingRecord, stageKey: PipelineStageKey): PipelineJobView {
    if (stageKey === 'RCN') {
      return {
        processId: record.id,
        process: record,
        stageKey,
        machineOrOperator: `Batch ${record.rcnBatchId}`,
        inputWeight: record.boiling.inputWeight,
        outputWeight: record.boiling.inputWeight,
        status: 'COMPLETED'
      };
    }

    if (stageKey === 'BOILING') {
      return {
        processId: record.id,
        process: record,
        stageKey,
        machineOrOperator: record.boiling.operator || 'Boiling Unit',
        inputWeight: record.boiling.inputWeight,
        outputWeight: record.boiling.outputWeight,
        status: record.boiling.status
      };
    }

    if (stageKey === 'CUTTING') {
      const outputWeight =
        record.cutting.kernelWeight !== null && record.cutting.shellWeight !== null && record.cutting.uncutWeight !== null
          ? Number((record.cutting.kernelWeight + record.cutting.shellWeight + record.cutting.uncutWeight).toFixed(1))
          : null;

      return {
        processId: record.id,
        process: record,
        stageKey,
        machineOrOperator: record.cutting.machineId || record.cutting.operator || 'Manual',
        inputWeight: record.cutting.inputWeight,
        outputWeight,
        status: record.cutting.status
      };
    }

    return {
      processId: record.id,
      process: record,
      stageKey,
      machineOrOperator: 'Not assigned',
      inputWeight: null,
      outputWeight: null,
      status: 'PENDING'
    };
  }

  private getPipelineStageStatus(stageKey: PipelineStageKey, jobs: PipelineJobView[]): PipelineDisplayStatus {
    if (jobs.length === 0) {
      return 'PENDING';
    }

    if (stageKey === 'DRYING' || stageKey === 'PACKING') {
      return 'PENDING';
    }

    if (jobs.some((job) => job.status === 'IN_PROGRESS')) {
      return 'RUNNING';
    }

    if (jobs.every((job) => job.status === 'COMPLETED')) {
      return 'COMPLETED';
    }

    if (jobs.some((job) => job.status === 'COMPLETED')) {
      return 'RUNNING';
    }

    return 'PENDING';
  }
}
