import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { DryingBatch, DryingCandidate, DryingCompletePayload, DryingCreatePayload } from './drying.models';

@Component({
  selector: 'app-drying-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule
  ],
  templateUrl: './drying-form.component.html',
  styleUrls: ['./drying-form.component.scss']
})
export class DryingFormComponent implements OnChanges {
  @Input() mode: 'create' | 'complete' = 'create';
  @Input() candidates: DryingCandidate[] = [];
  @Input() batch: DryingBatch | null = null;
  @Input() saving = false;

  @Output() closeDrawer = new EventEmitter<void>();
  @Output() createBatch = new EventEmitter<DryingCreatePayload>();
  @Output() completeBatch = new EventEmitter<DryingCompletePayload>();

  readonly createForm = this.formBuilder.group({
    rcnId: ['', Validators.required],
    vendor: [{ value: '', disabled: true }, Validators.required],
    weightBeforeDrying: [null as number | null, [Validators.required, Validators.min(1)]],
    moistureBefore: [null as number | null, [Validators.required, Validators.min(0), Validators.max(100)]]
  });

  readonly completeForm = this.formBuilder.group({
    weightAfterDrying: [null as number | null, [Validators.required, Validators.min(1)]],
    moistureAfter: [null as number | null, [Validators.required, Validators.min(0), Validators.max(100)]],
    dryingStartDate: ['', Validators.required],
    dryingEndDate: ['', Validators.required],
    numberOfCycles: [null as number | null, [Validators.required, Validators.min(1)]]
  });

  constructor(private readonly formBuilder: FormBuilder) {
    this.createForm.controls.rcnId.valueChanges.subscribe((value) => {
      const candidate = this.candidates.find((item) => item.rcnId === value);
      this.createForm.patchValue(
        {
          vendor: candidate?.vendor ?? '',
          weightBeforeDrying: candidate?.weightBeforeDrying ?? null,
          moistureBefore: candidate?.moistureBefore ?? null
        },
        { emitEvent: false }
      );
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['batch'] || changes['mode'] || changes['candidates']) {
      this.patchForms();
    }
  }

  get weightLoss(): number {
    const before = this.batch?.weightBeforeDrying ?? this.createForm.controls.weightBeforeDrying.value ?? 0;
    const after = this.completeForm.controls.weightAfterDrying.value ?? this.batch?.weightAfterDrying ?? 0;
    return before > 0 && after > 0 ? before - after : 0;
  }

  get moistureReduction(): number {
    const before = this.batch?.moistureBefore ?? this.createForm.controls.moistureBefore.value ?? 0;
    const after = this.completeForm.controls.moistureAfter.value ?? this.batch?.moistureAfter ?? 0;
    return before > 0 && after >= 0 ? before - after : 0;
  }

  submitCreate(): void {
    this.createForm.markAllAsTouched();
    if (this.createForm.invalid) {
      return;
    }

    const raw = this.createForm.getRawValue();
    this.createBatch.emit({
      rcnId: raw.rcnId ?? '',
      weightBeforeDrying: Number(raw.weightBeforeDrying),
      moistureBefore: Number(raw.moistureBefore)
    });
  }

  submitComplete(): void {
    this.completeForm.markAllAsTouched();
    if (this.completeForm.invalid) {
      return;
    }

    const raw = this.completeForm.getRawValue();
    this.completeBatch.emit({
      weightAfterDrying: Number(raw.weightAfterDrying),
      moistureAfter: Number(raw.moistureAfter),
      dryingStartDate: raw.dryingStartDate ?? '',
      dryingEndDate: raw.dryingEndDate ?? '',
      numberOfCycles: Number(raw.numberOfCycles)
    });
  }

  private patchForms(): void {
    if (this.mode === 'create') {
      this.createForm.reset({
        rcnId: '',
        vendor: '',
        weightBeforeDrying: null,
        moistureBefore: null
      });
      return;
    }

    this.completeForm.reset({
      weightAfterDrying: this.batch?.weightAfterDrying ?? null,
      moistureAfter: this.batch?.moistureAfter ?? null,
      dryingStartDate: this.batch?.dryingStartDate ?? '',
      dryingEndDate: this.batch?.dryingEndDate ?? '',
      numberOfCycles: this.batch?.numberOfCycles ?? null
    });
  }
}
