import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { Buyer, SalesOrder, SalesOrderFormValue } from './sales.models';

@Component({
  selector: 'app-sales-form',
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
  templateUrl: './sales-form.component.html',
  styleUrls: ['./sales-form.component.scss']
})
export class SalesFormComponent implements OnChanges {
  @Input() buyers: Buyer[] = [];
  @Input() order: SalesOrder | null = null;
  @Input() open = false;
  @Input() saving = false;
  @Output() closeDrawer = new EventEmitter<void>();
  @Output() saveOrder = new EventEmitter<SalesOrderFormValue>();

  readonly productOptions = ['W180', 'W240', 'W320', 'W450'];

  readonly form = this.formBuilder.group({
    buyerId: ['', Validators.required],
    contactPerson: ['', Validators.required],
    destination: ['', Validators.required],
    productCategory: ['', Validators.required],
    quantity: [null as number | null, [Validators.required, Validators.min(1)]],
    pricePerKg: [null as number | null, [Validators.required, Validators.min(1)]]
  });

  constructor(private readonly formBuilder: FormBuilder) {
    this.form.controls.buyerId.valueChanges.subscribe((buyerId) => {
      const buyer = this.buyers.find((entry) => entry.id === buyerId);
      if (buyer && !this.order) {
        this.form.patchValue(
          {
            contactPerson: buyer.contactPerson,
            destination: buyer.destination
          },
          { emitEvent: false }
        );
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['order'] || changes['open']) && this.open) {
      if (this.order) {
        this.form.patchValue({
          buyerId: this.order.buyerId,
          contactPerson: this.order.contactPerson,
          destination: this.order.destination,
          productCategory: this.order.productCategory,
          quantity: this.order.quantity,
          pricePerKg: this.order.pricePerKg
        });
      } else {
        this.form.reset({
          buyerId: '',
          contactPerson: '',
          destination: '',
          productCategory: '',
          quantity: null,
          pricePerKg: null
        });
      }
    }
  }

  get totalAmount(): number {
    const quantity = Number(this.form.controls.quantity.value ?? 0);
    const price = Number(this.form.controls.pricePerKg.value ?? 0);
    return quantity * price;
  }

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }

    const raw = this.form.getRawValue();
    this.saveOrder.emit({
      id: this.order?.id,
      buyerId: raw.buyerId ?? '',
      contactPerson: (raw.contactPerson ?? '').trim(),
      destination: (raw.destination ?? '').trim(),
      productCategory: raw.productCategory ?? '',
      quantity: Number(raw.quantity),
      pricePerKg: Number(raw.pricePerKg)
    });
  }
}
