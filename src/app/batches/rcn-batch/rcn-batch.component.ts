import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BatchDataService } from '../batch-data.service';
import { RcnBatch } from '../models/batch.models';

@Component({
  selector: 'app-rcn-batch',
  templateUrl: './rcn-batch.component.html',
  styleUrls: ['./rcn-batch.component.scss']
})
export class RcnBatchComponent {
  rcnList: RcnBatch[] = [];
  rcnForm!: FormGroup;
  editIndex: number | null = null;
  displayedColumns = [
    'rcn_id', 'party_id', 'origin', 'proc_date',
    'truck_id', 'gross_weight', 'tare_weight', 'net_weight', 'status', 'actions'
  ];

  constructor(private fb: FormBuilder, private svc: BatchDataService) {}

  ngOnInit() {
    this.rcnForm = this.fb.group({
      rcn_id: [''],
      party_id: ['', Validators.required],
      origin: ['', Validators.required],
      proc_date: ['', Validators.required],
      truck_id: ['', Validators.required],
      gross_weight: [0, Validators.required],
      tare_weight: [0, Validators.required],
      net_weight: [{ value: 0, disabled: true }],
      moisture_before: [0],
      moisture_after: [0],
      weight_before_drying: [0],
      weight_after_drying: [0],
      drying_batch_id: [''],
      status: ['Pending', Validators.required]
    });

    this.svc.rcn$.subscribe(v => this.rcnList = v);
  }

  calculateNetWeight() {
    const gross = this.rcnForm.get('gross_weight')?.value || 0;
    const tare = this.rcnForm.get('tare_weight')?.value || 0;
    const net = Math.max(gross - tare, 0);
    this.rcnForm.get('net_weight')?.setValue(net);
  }

  submitForm() {
    if (this.rcnForm.valid) {
      const value = { ...this.rcnForm.getRawValue() };

      if (this.editIndex !== null) {
        this.rcnList[this.editIndex] = value;
        this.editIndex = null;
      } else {
        value.rcn_id = 'RCN' + Date.now().toString().slice(-6);
        this.rcnList.push(value);
      }

      (this.svc as any)._rcn.next([...this.rcnList]);
      this.resetForm();
    }
  }

  editRCN(index: number) {
    this.editIndex = index;
    this.rcnForm.patchValue(this.rcnList[index]);
  }

  deleteRCN(index: number) {
    this.rcnList.splice(index, 1);
    (this.svc as any)._rcn.next([...this.rcnList]);
  }

  resetForm() {
    this.rcnForm.reset({
      status: 'Pending',
      gross_weight: 0,
      tare_weight: 0,
      net_weight: 0
    });
    this.editIndex = null;
  }
}
