import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { combineLatest } from 'rxjs';
import { RcnBatch, RcnBatchFormValue, RcnVendor } from './rcn.models';

@Component({
  selector: 'app-rcn-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDividerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule
  ],
  templateUrl: './rcn-form.component.html',
  styleUrls: ['./rcn-form.component.scss']
})
export class RcnFormComponent implements OnChanges {
  @Input() vendors: RcnVendor[] = [];
  @Input() batch: RcnBatch | null = null;
  @Input() open = false;
  @Input() saving = false;

  @Output() closeDrawer = new EventEmitter<void>();
  @Output() saveBatch = new EventEmitter<RcnBatchFormValue>();

  vendorContracts: string[] = [];
  vendorOrigins: string[] = [];

  readonly form = this.formBuilder.group({
    vendorId: ['', Validators.required],
    contract: [''],
    origin: ['', Validators.required],
    truckId: [''],
    driverName: [''],
    driverPhone: [''],
    grossWeight: [null as number | null, [Validators.required, Validators.min(1)]],
    tareWeight: [null as number | null, [Validators.required, Validators.min(0)]],
    moistureBefore: [null as number | null],
    moistureAfter: [null as number | null],
    requiresDrying: [false],
    procurementDate: [null as Date | null],
    remarks: ['']
  });

  constructor(private readonly formBuilder: FormBuilder) {
    combineLatest([
      this.form.controls.grossWeight.valueChanges,
      this.form.controls.tareWeight.valueChanges
    ]).subscribe(([gross, tare]) => {
      if (gross !== null && tare !== null && gross < tare) {
        this.form.controls.tareWeight.setErrors({ exceedsGross: true });
      } else if (this.form.controls.tareWeight.hasError('exceedsGross')) {
        const errors = { ...(this.form.controls.tareWeight.errors ?? {}) };
        delete errors['exceedsGross'];
        this.form.controls.tareWeight.setErrors(Object.keys(errors).length ? errors : null);
      }
    });

    this.form.controls.vendorId.valueChanges.subscribe((vendorId) => {
      const vendor = this.vendors.find((entry) => entry.id === vendorId);
      this.vendorContracts = vendor?.contracts ?? [];
      this.vendorOrigins = vendor?.origins ?? [];

      if (this.vendorContracts.length && !this.vendorContracts.includes(this.form.controls.contract.value ?? '')) {
        this.form.controls.contract.setValue(this.vendorContracts[0]);
      }

      if (this.vendorOrigins.length && !this.vendorOrigins.includes(this.form.controls.origin.value ?? '')) {
        this.form.controls.origin.setValue(this.vendorOrigins[0]);
      }
    });
  }

  get drawerTitle(): string {
    return this.batch ? 'Edit RCN Batch' : 'New RCN Batch';
  }

  get isReadOnlyMode(): boolean {
    return !!this.batch;
  }

  get netWeight(): number {
    const gross = Number(this.form.controls.grossWeight.value ?? 0);
    const tare = Number(this.form.controls.tareWeight.value ?? 0);
    return Math.max(gross - tare, 0);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['batch'] || changes['open']) {
      this.patchForm();
    }

    if (changes['vendors'] && this.form.controls.vendorId.value) {
      const vendor = this.vendors.find((entry) => entry.id === this.form.controls.vendorId.value);
      this.vendorContracts = vendor?.contracts ?? [];
      this.vendorOrigins = vendor?.origins ?? [];
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    this.saveBatch.emit({
      id: this.batch?.id,
      vendorId: raw.vendorId ?? '',
      contract: raw.contract || null,
      origin: raw.origin ?? '',
      truckId: raw.truckId ?? '',
      driverName: raw.driverName ?? '',
      driverPhone: raw.driverPhone ?? '',
      grossWeight: Number(raw.grossWeight ?? 0),
      tareWeight: Number(raw.tareWeight ?? 0),
      moistureBefore: Number(raw.moistureBefore ?? 0),
      moistureAfter: raw.moistureAfter === null || raw.moistureAfter === undefined ? null : Number(raw.moistureAfter),
      requiresDrying: !!raw.requiresDrying,
      procurementDate: this.serializeDate(raw.procurementDate),
      remarks: raw.remarks ?? '',
      status: this.batch?.status ?? 'Pending QC'
    });
  }

  close(): void {
    this.closeDrawer.emit();
  }

  private patchForm(): void {
    if (!this.open) {
      return;
    }

    const batch = this.batch;
    this.form.reset({
      vendorId: batch?.vendorId ?? '',
      contract: batch?.contract ?? '',
      origin: batch?.origin ?? '',
      truckId: batch?.truckId ?? '',
      driverName: batch?.driverName ?? '',
      driverPhone: batch?.driverPhone ?? '',
      grossWeight: batch?.grossWeight ?? null,
      tareWeight: batch?.tareWeight ?? null,
      moistureBefore: batch?.moistureBefore ?? null,
      moistureAfter: batch?.moistureAfter ?? null,
      requiresDrying: batch?.requiresDrying ?? false,
      procurementDate: batch?.procurementDate ? new Date(batch.procurementDate) : null,
      remarks: batch?.remarks ?? ''
    });

    const vendor = this.vendors.find((entry) => entry.id === (batch?.vendorId ?? ''));
    this.vendorContracts = vendor?.contracts ?? [];
    this.vendorOrigins = vendor?.origins ?? [];
  }

  private serializeDate(value: unknown): string {
    if (!value) {
      return '';
    }

    const date = value instanceof Date ? value : new Date(String(value));
    return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10);
  }
}
