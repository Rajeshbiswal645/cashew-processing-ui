import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';
import { JobCardComponent } from './job-card.component';
import { JobDrawerComponent } from './job-drawer.component';
import { PipelineJob, PipelineStage, ProcessingPipeline } from './processing.models';
import { ProcessingService } from './processing.service';
import { StageCardComponent } from './stage-card.component';

@Component({
  selector: 'app-processing-pipeline',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    MatSidenavModule,
    MatSnackBarModule,
    StageCardComponent,
    JobCardComponent,
    JobDrawerComponent
  ],
  templateUrl: './processing-pipeline.component.html',
  styleUrls: ['./processing-pipeline.component.scss']
})
export class ProcessingPipelineComponent implements OnInit, OnDestroy {
  pipeline: ProcessingPipeline | null = null;
  expandedStageId: string | null = null;
  selectedStage: PipelineStage | null = null;
  selectedJob: PipelineJob | null = null;
  isLoading = true;
  isSaving = false;

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly processingService: ProcessingService,
    private readonly snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.processingService
      .getPipeline()
      .pipe(takeUntil(this.destroy$))
      .subscribe((pipeline) => {
        this.pipeline = pipeline;
        this.isLoading = false;

        if (!this.expandedStageId) {
          this.expandedStageId = this.getActiveStage()?.id ?? pipeline.stages[0]?.id ?? null;
        }

        this.syncDrawerSelection();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get expandedStage(): PipelineStage | null {
    return this.pipeline?.stages.find((stage) => stage.id === this.expandedStageId) ?? null;
  }

  get drawerOpened(): boolean {
    return !!this.selectedJob;
  }

  toggleStage(stage: PipelineStage): void {
    const willCollapse = this.expandedStageId === stage.id;
    this.expandedStageId = willCollapse ? null : stage.id;

    if (willCollapse || this.selectedStage?.id !== stage.id) {
      this.closeDrawer();
    }
  }

  openJob(stage: PipelineStage, job: PipelineJob): void {
    this.expandedStageId = stage.id;
    this.selectedStage = stage;
    this.selectedJob = job;
  }

  closeDrawer(): void {
    this.selectedStage = null;
    this.selectedJob = null;
  }

  saveJobDraft(values: Partial<PipelineJob>): void {
    if (!this.selectedStage || !this.selectedJob) {
      return;
    }

    this.processingService
      .updateJob(this.selectedStage.id, this.selectedJob.id, values)
      .pipe(takeUntil(this.destroy$))
      .subscribe();
  }

  startJob(values: Partial<PipelineJob>): void {
    if (!this.selectedStage || !this.selectedJob) {
      return;
    }

    this.isSaving = true;
    this.processingService
      .startJob(this.selectedStage.id, this.selectedJob.id, values)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isSaving = false;
          this.snackBar.open(`${this.selectedJob?.machineLabel} started in ${this.selectedStage?.name}.`, 'Close', {
            duration: 2400
          });
        },
        error: (error: Error) => {
          this.isSaving = false;
          this.snackBar.open(error.message, 'Close', { duration: 2600 });
        }
      });
  }

  completeJob(values: Partial<PipelineJob>): void {
    if (!this.selectedStage || !this.selectedJob) {
      return;
    }

    this.isSaving = true;
    this.processingService
      .completeJob(this.selectedStage.id, this.selectedJob.id, values)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (pipeline) => {
          this.pipeline = pipeline;
          this.isSaving = false;
          this.syncDrawerSelection();

          const nextStage = this.getActiveStage();
          if (nextStage) {
            this.expandedStageId = nextStage.id;
          }

          this.snackBar.open(`Job completed. ${this.selectedStage?.name} has been updated.`, 'Close', {
            duration: 2600
          });
        },
        error: (error: Error) => {
          this.isSaving = false;
          this.snackBar.open(error.message, 'Close', { duration: 2600 });
        }
      });
  }

  isStageExpanded(stage: PipelineStage): boolean {
    return this.expandedStageId === stage.id;
  }

  trackStage(_: number, stage: PipelineStage): string {
    return stage.id;
  }

  trackJob(_: number, job: PipelineJob): string {
    return job.id;
  }

  get hasData(): boolean {
    return !!this.pipeline && this.pipeline.stages.some((stage) => stage.jobs.length > 0);
  }

  get expandedStageTitle(): string {
    return this.expandedStage?.name ?? 'Processing Jobs';
  }

  get expandedStageIndex(): number {
    if (!this.pipeline || !this.expandedStageId) {
      return 0;
    }

    const index = this.pipeline.stages.findIndex((stage) => stage.id === this.expandedStageId);
    return index >= 0 ? index : 0;
  }

  private getActiveStage(): PipelineStage | null {
    if (!this.pipeline) {
      return null;
    }

    return (
      this.pipeline.stages.find((stage) => stage.status === 'IN_PROGRESS') ??
      this.pipeline.stages.find((stage) => stage.enabled && stage.status !== 'COMPLETED') ??
      this.pipeline.stages[this.pipeline.stages.length - 1] ??
      null
    );
  }

  private syncDrawerSelection(): void {
    if (!this.pipeline || !this.selectedStage || !this.selectedJob) {
      return;
    }

    const stage = this.pipeline.stages.find((item) => item.id === this.selectedStage?.id);
    const job = stage?.jobs.find((item) => item.id === this.selectedJob?.id);

    if (!stage || !job) {
      this.closeDrawer();
      return;
    }

    this.selectedStage = stage;
    this.selectedJob = job;
  }
}
