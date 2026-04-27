import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { InvoiceFormValue, InvoiceParty, InvoiceType, SalesOrderOption } from './accounts.models';

@Component({
  selector: 'app-invoice-form',
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
  templateUrl: './invoice-form.component.html',
  styleUrls: ['./invoice-form.component.scss']
})
export class InvoiceFormComponent implements OnChanges {
  @Input() parties: InvoiceParty[] = [];
  @Input() salesOrders: SalesOrderOption[] = [];
  @Input() saving = false;
  @Input() open = false;
  @Output() closeDrawer = new EventEmitter<void>();
  @Output() saveInvoice = new EventEmitter<InvoiceFormValue>();

  readonly invoiceTypeOptions: InvoiceType[] = ['SALES', 'PURCHASE'];
  readonly gstOptions = [5, 12, 18];

  readonly form = this.formBuilder.group({
    invoiceType: ['SALES' as InvoiceType, Validators.required],
    partyId: ['', Validators.required],
    linkedSalesOrderId: [''],
    invoiceDate: [new Date().toISOString().slice(0, 10), Validators.required],
    gstPercent: [18, Validators.required],
    lineItems: this.formBuilder.array([this.createLineItem()])
  });

  constructor(private readonly formBuilder: FormBuilder) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['open'] && this.open) {
      this.form.reset({
        invoiceType: 'SALES',
        partyId: '',
        linkedSalesOrderId: '',
        invoiceDate: new Date().toISOString().slice(0, 10),
        gstPercent: 18
      });
      this.lineItems.clear();
      this.lineItems.push(this.createLineItem());
    }
  }

  get lineItems(): FormArray {
    return this.form.get('lineItems') as FormArray;
  }

  getLineItemGroup(index: number): FormGroup {
    return this.lineItems.at(index) as FormGroup;
  }

  get subtotal(): number {
    return this.lineItems.controls.reduce((sum, control) => {
      const quantity = Number(control.get('quantity')?.value ?? 0);
      const pricePerUnit = Number(control.get('pricePerUnit')?.value ?? 0);
      return sum + quantity * pricePerUnit;
    }, 0);
  }

  get gstAmount(): number {
    return (this.subtotal * Number(this.form.controls.gstPercent.value ?? 0)) / 100;
  }

  get totalAmount(): number {
    return this.subtotal + this.gstAmount;
  }

  get visibleParties(): InvoiceParty[] {
    const invoiceType = this.form.controls.invoiceType.value;
    return this.parties.filter((party) => invoiceType === 'SALES' ? party.kind === 'BUYER' : party.kind === 'VENDOR');
  }

  addItem(): void {
    this.lineItems.push(this.createLineItem());
  }

  removeItem(index: number): void {
    if (this.lineItems.length === 1) {
      return;
    }

    this.lineItems.removeAt(index);
  }

  getLineAmount(index: number): number {
    const control = this.lineItems.at(index);
    const quantity = Number(control.get('quantity')?.value ?? 0);
    const pricePerUnit = Number(control.get('pricePerUnit')?.value ?? 0);
    return quantity * pricePerUnit;
  }

  submit(): void {
    this.form.markAllAsTouched();
    this.lineItems.controls.forEach((control) => control.markAllAsTouched());

    if (this.form.invalid || this.lineItems.length === 0) {
      return;
    }

    const raw = this.form.getRawValue();
    this.saveInvoice.emit({
      invoiceType: raw.invoiceType as InvoiceType,
      partyId: raw.partyId ?? '',
      linkedSalesOrderId: raw.linkedSalesOrderId || null,
      invoiceDate: raw.invoiceDate ?? '',
      gstPercent: Number(raw.gstPercent ?? 0),
      lineItems: this.lineItems.controls.map((control) => {
        const quantity = Number(control.get('quantity')?.value ?? 0);
        const pricePerUnit = Number(control.get('pricePerUnit')?.value ?? 0);
        return {
          itemName: (control.get('itemName')?.value ?? '').trim(),
          quantity,
          pricePerUnit,
          amount: quantity * pricePerUnit
        };
      })
    });
  }

  private createLineItem() {
    return this.formBuilder.group({
      itemName: ['', Validators.required],
      quantity: [null as number | null, [Validators.required, Validators.min(1)]],
      pricePerUnit: [null as number | null, [Validators.required, Validators.min(1)]]
    });
  }
}
