import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CuttingPayload, ProcessingDetail } from './processing.models';

@Component({
  selector: 'app-cutting-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatProgressSpinnerModule],
  templateUrl: './cutting-form.component.html',
  styleUrls: ['./cutting-form.component.scss']
})
export class CuttingFormComponent implements OnChanges {
  @Input() process: ProcessingDetail | null = null;
  @Input() saving = false;
  @Output() startCutting = new EventEmitter<CuttingPayload>();
  @Output() completeCutting = new EventEmitter<CuttingPayload>();

  readonly form = this.formBuilder.group(
    {
      machineId: ['', [Validators.required, Validators.maxLength(30)]],
      operator: ['', [Validators.required, Validators.maxLength(50)]],
      inputWeight: [{ value: '', disabled: true }, Validators.required],
      kernelWeight: [null as number | null, [Validators.min(0)]],
      shellWeight: [null as number | null, [Validators.min(0)]],
      uncutWeight: [null as number | null, [Validators.min(0)]]
    },
    { validators: [this.outputWeightValidator.bind(this)] }
  );

  constructor(private readonly formBuilder: FormBuilder) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['process'] && this.process) {
      this.form.patchValue({
        machineId: this.process.cutting.machineId,
        operator: this.process.cutting.operator,
        inputWeight: this.process.cutting.inputWeight?.toString() ?? '',
        kernelWeight: this.process.cutting.kernelWeight,
        shellWeight: this.process.cutting.shellWeight,
        uncutWeight: this.process.cutting.uncutWeight
      });

      if (this.process.cutting.status === 'COMPLETED') {
        this.form.disable({ emitEvent: false });
      } else {
        this.form.enable({ emitEvent: false });
        this.form.controls.inputWeight.disable({ emitEvent: false });
      }
    }
  }

  get canStart(): boolean {
    return !!this.process && this.process.boiling.status === 'COMPLETED' && this.process.cutting.status === 'PENDING' && !this.saving;
  }

  get canComplete(): boolean {
    return !!this.process && this.process.boiling.status === 'COMPLETED' && this.process.cutting.status !== 'COMPLETED' && !this.saving;
  }

  get yieldPercentage(): number {
    const inputWeight = Number(this.process?.cutting.inputWeight ?? 0);
    const kernelWeight = Number(this.form.controls.kernelWeight.value ?? 0);

    if (!inputWeight) {
      return 0;
    }

    return Number(((kernelWeight / inputWeight) * 100).toFixed(1));
  }

  get lossPercentage(): number {
    const inputWeight = Number(this.process?.cutting.inputWeight ?? 0);
    const totalOutput = Number(this.form.controls.kernelWeight.value ?? 0) +
      Number(this.form.controls.shellWeight.value ?? 0) +
      Number(this.form.controls.uncutWeight.value ?? 0);

    if (!inputWeight) {
      return 0;
    }

    return Number((((inputWeight - totalOutput) / inputWeight) * 100).toFixed(1));
  }

  submitStart(): void {
    this.form.controls.machineId.markAsTouched();
    this.form.controls.operator.markAsTouched();

    if (this.form.controls.machineId.invalid || this.form.controls.operator.invalid) {
      return;
    }

    this.startCutting.emit(this.buildPayload(false));
  }

  submitComplete(): void {
    this.form.controls.kernelWeight.addValidators(Validators.required);
    this.form.controls.shellWeight.addValidators(Validators.required);
    this.form.controls.uncutWeight.addValidators(Validators.required);
    this.form.controls.kernelWeight.updateValueAndValidity({ emitEvent: false });
    this.form.controls.shellWeight.updateValueAndValidity({ emitEvent: false });
    this.form.controls.uncutWeight.updateValueAndValidity({ emitEvent: false });
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      return;
    }

    this.completeCutting.emit(this.buildPayload(true));
  }

  private buildPayload(includeOutputs: boolean): CuttingPayload {
    const raw = this.form.getRawValue();

    return {
      machineId: (raw.machineId ?? '').trim(),
      operator: (raw.operator ?? '').trim(),
      kernelWeight: includeOutputs ? this.toNumber(raw.kernelWeight) : null,
      shellWeight: includeOutputs ? this.toNumber(raw.shellWeight) : null,
      uncutWeight: includeOutputs ? this.toNumber(raw.uncutWeight) : null
    };
  }

  private outputWeightValidator(control: AbstractControl): ValidationErrors | null {
    const inputWeight = Number(this.process?.cutting.inputWeight ?? 0);
    const kernelWeight = Number(control.get('kernelWeight')?.value ?? 0);
    const shellWeight = Number(control.get('shellWeight')?.value ?? 0);
    const uncutWeight = Number(control.get('uncutWeight')?.value ?? 0);

    if (!inputWeight || kernelWeight + shellWeight + uncutWeight <= inputWeight) {
      return null;
    }

    return { outputOverflow: true };
  }

  private toNumber(value: number | null): number | null {
    return value === null || value === undefined ? null : Number(value);
  }
}
