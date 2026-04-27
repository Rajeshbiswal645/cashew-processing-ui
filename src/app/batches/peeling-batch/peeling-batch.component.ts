import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PeelingBatch, KernelBatch } from '../models/batch.models';

@Component({
  selector: 'app-peeling-batch',
  templateUrl: './peeling-batch.component.html',
  styleUrls: ['./peeling-batch.component.scss']
})
export class PeelingBatchComponent implements OnInit {
  peelingList: PeelingBatch[] = [];
  kernelList: KernelBatch[] = [];
  operatorList = [
    { id: 'OP001', name: 'John Doe' },
    { id: 'OP002', name: 'Jane Smith' },
    { id: 'OP003', name: 'Ravi Kumar' }
  ];

  peelingForm!: FormGroup;
  editIndex: number | null = null;
  displayedColumns: string[] = [
    'peeling_id',
    'kernel_batch_id',
    'input_weight',
    'cat1_weight',
    'cat6_weight',
    'husk_weight',
    'operator_id',
    'actions'
  ];

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    // initialize form
    this.peelingForm = this.fb.group({
      kernel_batch_id: ['', Validators.required],
      input_weight: [null, [Validators.required, Validators.min(0.1)]],
      cat1_weight: [null, [Validators.required, Validators.min(0)]],
      cat6_weight: [null, [Validators.required, Validators.min(0)]],
      husk_weight: [null, [Validators.required, Validators.min(0)]],
      operator_id: ['', Validators.required]
    });

    // Dummy kernel list
    this.kernelList = [
      { kernel_batch_id: 'KRN001', cutting_id: 'CUT001', input_weight: 50, after_borma_weight: 45, after_humid_weight: 43, status: 'DONE' },
      { kernel_batch_id: 'KRN002', cutting_id: 'CUT002', input_weight: 60, after_borma_weight: 55, after_humid_weight: 52, status: 'DONE' },
      { kernel_batch_id: 'KRN003', cutting_id: 'CUT003', input_weight: 40, after_borma_weight: 37, after_humid_weight: 35, status: 'DONE' }
    ];

    // Dummy peeling list
    this.peelingList = [
      {
        peeling_id: 'PEEL001',
        kernel_batch_id: 'KRN001',
        input_weight: 43,
        cat1_weight: 25,
        cat6_weight: 10,
        husk_weight: 8,
        operator_id: 'OP001'
      }
    ];
  }

  /** Add or Update Peeling Batch */
  submitForm() {
    if (this.peelingForm.invalid) return;
    const formValue = this.peelingForm.value;

    if (this.editIndex !== null) {
      // Update
      this.peelingList[this.editIndex] = {
        ...this.peelingList[this.editIndex],
        ...formValue
      };
    } else {
      // Add new
      const newBatch: PeelingBatch = {
        peeling_id: 'PEEL' + (this.peelingList.length + 1).toString().padStart(3, '0'),
        ...formValue
      };
      this.peelingList.push(newBatch);
    }

    this.resetForm();
  }

  editPeeling(index: number) {
    this.editIndex = index;
    const batch = this.peelingList[index];
    this.peelingForm.patchValue(batch);
  }

  deletePeeling(index: number) {
    this.peelingList.splice(index, 1);
  }

  resetForm() {
    this.peelingForm.reset();
    this.editIndex = null;
  }

  getOperatorName(id: string): string {
    return this.operatorList.find(op => op.id === id)?.name || '-';
  }
}
