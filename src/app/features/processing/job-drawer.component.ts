import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { PipelineJob, PipelineStage } from './processing.models';

@Component({
  selector: 'app-job-drawer',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule],
  templateUrl: './job-drawer.component.html',
  styleUrls: ['./job-drawer.component.scss']
})
export class JobDrawerComponent implements OnChanges {
  @Input({ required: true }) stage!: PipelineStage;
  @Input({ required: true }) job!: PipelineJob;
  @Input() saving = false;
  @Output() closeDrawer = new EventEmitter<void>();
  @Output() saveDraft = new EventEmitter<Partial<PipelineJob>>();
  @Output() startJob = new EventEmitter<Partial<PipelineJob>>();
  @Output() completeJob = new EventEmitter<Partial<PipelineJob>>();

  readonly form = this.formBuilder.group({
    machineId: [''],
    operator: [''],
    inputWeight: [null as number | null],
    outputWeight: [null as number | null],
    kernelWeight: [null as number | null],
    shellWeight: [null as number | null],
    uncutWeight: [null as number | null],
    temperature: [null as number | null],
    startTime: [''],
    endTime: ['']
  });

  constructor(private readonly formBuilder: FormBuilder) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['job']) {
      this.form.patchValue(
        {
          machineId: this.job.machineId,
          operator: this.job.operator,
          inputWeight: this.job.inputWeight,
          outputWeight: this.job.outputWeight,
          kernelWeight: this.job.kernelWeight,
          shellWeight: this.job.shellWeight,
          uncutWeight: this.job.uncutWeight,
          temperature: this.job.temperature,
          startTime: this.job.startTime ?? '',
          endTime: this.job.endTime ?? ''
        },
        { emitEvent: false }
      );
    }
  }

  get isCuttingStage(): boolean {
    return this.stage.key === 'CUTTING';
  }

  get isBoilingStage(): boolean {
    return this.stage.key === 'BOILING';
  }

  get isLocked(): boolean {
    return !this.stage.enabled;
  }

  get yieldPercentage(): number {
    const values = this.form.getRawValue();
    const input = Number(values.inputWeight || 0);

    if (!input) {
      return 0;
    }

    if (this.isCuttingStage) {
      const kernel = Number(values.kernelWeight || 0);
      return this.round((kernel / input) * 100);
    }

    const output = Number(values.outputWeight || 0);
    return this.round((output / input) * 100);
  }

  onStart(): void {
    const payload = this.createPayload();
    this.saveDraft.emit(payload);
    this.startJob.emit(payload);
  }

  onComplete(): void {
    const payload = this.createPayload();
    this.saveDraft.emit(payload);
    this.completeJob.emit(payload);
  }

  private createPayload(): Partial<PipelineJob> {
    const values = this.form.getRawValue();

    return {
      machineId: values.machineId ?? '',
      operator: values.operator ?? '',
      inputWeight: this.toNumber(values.inputWeight),
      outputWeight: this.toNumber(values.outputWeight),
      kernelWeight: this.toNumber(values.kernelWeight),
      shellWeight: this.toNumber(values.shellWeight),
      uncutWeight: this.toNumber(values.uncutWeight),
      temperature: this.toNumber(values.temperature),
      startTime: values.startTime || null,
      endTime: values.endTime || null,
      yieldPercentage: this.yieldPercentage
    };
  }

  private round(value: number): number {
    return Number(value.toFixed(1));
  }

  private toNumber(value: number | string | null | undefined): number | null {
    if (value === null || value === undefined || value === '') {
      return null;
    }

    return Number(value);
  }
}
