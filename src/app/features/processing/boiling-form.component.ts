import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BoilingPayload, ProcessingDetail } from './processing.models';

@Component({
  selector: 'app-boiling-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatProgressSpinnerModule],
  templateUrl: './boiling-form.component.html',
  styleUrls: ['./boiling-form.component.scss']
})
export class BoilingFormComponent implements OnChanges {
  @Input() process: ProcessingDetail | null = null;
  @Input() saving = false;
  @Output() startBoiling = new EventEmitter<BoilingPayload>();
  @Output() completeBoiling = new EventEmitter<BoilingPayload>();

  readonly form = this.formBuilder.group({
    inputWeight: [{ value: '', disabled: true }, Validators.required],
    startTime: ['', Validators.required],
    endTime: [''],
    temperature: [null as number | null, [Validators.required, Validators.min(80), Validators.max(130)]],
    operator: ['', [Validators.required, Validators.maxLength(50)]]
  });

  constructor(private readonly formBuilder: FormBuilder) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['process'] && this.process) {
      this.form.patchValue({
        inputWeight: this.process.boiling.inputWeight.toString(),
        startTime: this.process.boiling.startTime ?? '',
        endTime: this.process.boiling.endTime ?? '',
        temperature: this.process.boiling.temperature,
        operator: this.process.boiling.operator
      });

      this.form.controls.endTime.clearValidators();
      this.form.controls.endTime.updateValueAndValidity({ emitEvent: false });

      if (this.process.boiling.status === 'COMPLETED') {
        this.form.disable({ emitEvent: false });
      } else {
        this.form.enable({ emitEvent: false });
        this.form.controls.inputWeight.disable({ emitEvent: false });
      }
    }
  }

  get canStart(): boolean {
    return !!this.process && this.process.boiling.status === 'PENDING' && !this.saving;
  }

  get canComplete(): boolean {
    return !!this.process && this.process.boiling.status !== 'COMPLETED' && !this.saving;
  }

  submitStart(): void {
    if (!this.validateForStart()) {
      return;
    }

    this.startBoiling.emit(this.buildPayload(false));
  }

  submitComplete(): void {
    if (!this.validateForComplete()) {
      return;
    }

    this.completeBoiling.emit(this.buildPayload(true));
  }

  private validateForStart(): boolean {
    this.form.controls.startTime.markAsTouched();
    this.form.controls.temperature.markAsTouched();
    this.form.controls.operator.markAsTouched();
    return !this.form.controls.startTime.invalid && !this.form.controls.temperature.invalid && !this.form.controls.operator.invalid;
  }

  private validateForComplete(): boolean {
    this.form.controls.endTime.addValidators(Validators.required);
    this.form.controls.endTime.updateValueAndValidity({ emitEvent: false });
    this.form.markAllAsTouched();
    return this.form.valid;
  }

  private buildPayload(requireEndTime: boolean): BoilingPayload {
    const raw = this.form.getRawValue();

    return {
      startTime: raw.startTime ?? '',
      endTime: requireEndTime ? raw.endTime ?? '' : raw.endTime ?? null,
      temperature: Number(raw.temperature),
      operator: (raw.operator ?? '').trim()
    };
  }
}
