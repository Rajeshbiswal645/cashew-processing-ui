import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { QcBatch, QcInspectionPayload, QualityGrade } from './qc.models';
import { QcService } from './qc.service';

@Component({
  selector: 'app-qc-inspection-drawer',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule
  ],
  templateUrl: './qc-inspection-drawer.component.html',
  styleUrls: ['./qc-inspection-drawer.component.scss']
})
export class QcInspectionDrawerComponent implements OnChanges {
  @Input() batch: QcBatch | null = null;
  @Input() saving = false;
  @Input() readOnly = false;

  @Output() closeDrawer = new EventEmitter<void>();
  @Output() inspect = new EventEmitter<QcInspectionPayload>();

  readonly qualityGrades: QualityGrade[] = ['A', 'B', 'C'];
  readonly threshold = this.qcService.moistureThreshold;

  readonly inspectionForm = this.formBuilder.group({
    moistureBefore: [null as number | null, [Validators.required, Validators.min(0), Validators.max(100)]],
    moistureAfter: [null as number | null, [Validators.min(0), Validators.max(100)]],
    foreignMatter: [null as number | null, [Validators.min(0), Validators.max(100)]],
    qualityGrade: [null as QualityGrade | null, Validators.required],
    requiresDrying: [false],
    remarks: ['', [Validators.maxLength(300)]]
  });

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly qcService: QcService
  ) {
    this.inspectionForm.controls.moistureBefore.valueChanges.subscribe((value) => {
      const numeric = Number(value ?? 0);
      if (numeric > this.threshold) {
        this.inspectionForm.controls.requiresDrying.setValue(true, { emitEvent: false });
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['batch']) {
      this.patchForm();
    }

    if (changes['readOnly']) {
      if (this.readOnly) {
        this.inspectionForm.disable({ emitEvent: false });
      } else {
        this.inspectionForm.enable({ emitEvent: false });
      }
    }
  }

  get dryingMessageVisible(): boolean {
    return Number(this.inspectionForm.controls.moistureBefore.value ?? 0) > this.threshold;
  }

  submit(approved: boolean): void {
    if (this.readOnly) {
      return;
    }

    this.inspectionForm.markAllAsTouched();
    if (this.inspectionForm.invalid) {
      return;
    }

    const raw = this.inspectionForm.getRawValue();
    this.inspect.emit({
      moistureBefore: Number(raw.moistureBefore),
      moistureAfter: raw.moistureAfter === null ? null : Number(raw.moistureAfter),
      foreignMatter: raw.foreignMatter === null ? null : Number(raw.foreignMatter),
      qualityGrade: raw.qualityGrade as QualityGrade,
      requiresDrying: Boolean(raw.requiresDrying),
      remarks: raw.remarks?.trim() ?? '',
      approved
    });
  }

  private patchForm(): void {
    this.inspectionForm.reset({
      moistureBefore: this.batch?.moistureBefore ?? null,
      moistureAfter: this.batch?.moistureAfter ?? null,
      foreignMatter: this.batch?.foreignMatter ?? null,
      qualityGrade: this.batch?.qualityGrade ?? null,
      requiresDrying: this.batch?.requiresDrying ?? false,
      remarks: this.batch?.remarks ?? ''
    });

    if (this.readOnly) {
      this.inspectionForm.disable({ emitEvent: false });
    } else {
      this.inspectionForm.enable({ emitEvent: false });
    }
  }
}
