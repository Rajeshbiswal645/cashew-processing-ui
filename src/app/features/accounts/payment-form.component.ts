import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { InvoiceRecord, PaymentFormValue, PaymentMode } from './accounts.models';

@Component({
  selector: 'app-payment-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule
  ],
  templateUrl: './payment-form.component.html',
  styleUrls: ['./payment-form.component.scss']
})
export class PaymentFormComponent implements OnChanges {
  @Input() invoice: InvoiceRecord | null = null;
  @Input() saving = false;
  @Input() open = false;
  @Output() closeDrawer = new EventEmitter<void>();
  @Output() submitPayment = new EventEmitter<PaymentFormValue>();

  readonly paymentModes: PaymentMode[] = ['CASH', 'BANK_TRANSFER', 'UPI'];

  readonly form = this.formBuilder.group({
    paymentDate: [new Date().toISOString().slice(0, 10), Validators.required],
    paymentMode: ['BANK_TRANSFER' as PaymentMode, Validators.required],
    amountPaid: [null as number | null, [Validators.required, Validators.min(1)]],
    referenceNumber: ['', Validators.required]
  });

  constructor(private readonly formBuilder: FormBuilder) {}

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['invoice'] || changes['open']) && this.open && this.invoice) {
      this.form.reset({
        paymentDate: new Date().toISOString().slice(0, 10),
        paymentMode: 'BANK_TRANSFER',
        amountPaid: this.invoice.balanceAmount,
        referenceNumber: ''
      });
    }
  }

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }

    const raw = this.form.getRawValue();
    this.submitPayment.emit({
      paymentDate: raw.paymentDate ?? '',
      paymentMode: raw.paymentMode as PaymentMode,
      amountPaid: Number(raw.amountPaid),
      referenceNumber: (raw.referenceNumber ?? '').trim()
    });
  }
}
