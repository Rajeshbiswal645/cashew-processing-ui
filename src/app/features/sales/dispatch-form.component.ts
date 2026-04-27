import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DispatchPayload, SalesOrderDetail } from './sales.models';

@Component({
  selector: 'app-dispatch-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatProgressSpinnerModule],
  templateUrl: './dispatch-form.component.html',
  styleUrls: ['./dispatch-form.component.scss']
})
export class DispatchFormComponent implements OnChanges {
  @Input() order: SalesOrderDetail | null = null;
  @Input() saving = false;
  @Output() confirmDispatch = new EventEmitter<DispatchPayload>();

  readonly form = this.formBuilder.group({
    truckId: ['', Validators.required],
    driverName: ['', Validators.required],
    driverPhone: ['', [Validators.required, Validators.minLength(10)]],
    destination: ['', Validators.required],
    actualWeight: [null as number | null, [Validators.required, Validators.min(1)]],
    dispatchDate: ['', Validators.required]
  });

  constructor(private readonly formBuilder: FormBuilder) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['order'] && this.order) {
      this.form.patchValue({
        truckId: this.order.dispatch?.truckId ?? '',
        driverName: this.order.dispatch?.driverName ?? '',
        driverPhone: this.order.dispatch?.driverPhone ?? '',
        destination: this.order.dispatch?.destination ?? this.order.destination,
        actualWeight: this.order.dispatch?.actualWeight ?? this.order.allocatedQuantity,
        dispatchDate: this.order.dispatch?.dispatchDate ?? new Date().toISOString().slice(0, 10)
      });

      if (this.order.status === 'DISPATCHED' || this.order.status === 'COMPLETED') {
        this.form.disable({ emitEvent: false });
      } else {
        this.form.enable({ emitEvent: false });
      }
    }
  }

  get canDispatch(): boolean {
    return !!this.order && this.order.status === 'ALLOCATED' && !this.saving;
  }

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }

    const raw = this.form.getRawValue();
    this.confirmDispatch.emit({
      truckId: (raw.truckId ?? '').trim(),
      driverName: (raw.driverName ?? '').trim(),
      driverPhone: (raw.driverPhone ?? '').trim(),
      destination: (raw.destination ?? '').trim(),
      actualWeight: Number(raw.actualWeight),
      dispatchDate: raw.dispatchDate ?? ''
    });
  }
}
