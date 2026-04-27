import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-invoice-form',
  templateUrl: './invoice-form.component.html',
  styleUrls: ['./invoice-form.component.scss']
})
export class InvoiceFormComponent {

  form: FormGroup;
  isEdit = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<InvoiceFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {

    this.isEdit = !!data;

    this.form = this.fb.group({
      invoice_id: [data?.invoice_id || 'INV' + Date.now()],
      invoice_no: [data?.invoice_no || '', Validators.required],
      customer: [data?.customer || '', Validators.required],
      invoice_date: [data?.invoice_date || '', Validators.required],
      total_amount: [data?.total_amount || 0, Validators.required],
      status: [data?.status || 'PENDING', Validators.required]
    });
  }

  save() {
    if (this.form.invalid) return;
    this.dialogRef.close(this.form.value);
  }

  close() {
    this.dialogRef.close();
  }
}
