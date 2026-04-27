import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { SortingBatch, PeelingBatch } from '../models/batch.models';

@Component({
  selector: 'app-sorting-batch',
  templateUrl: './sorting-batch.component.html',
  styleUrls: ['./sorting-batch.component.scss']
})
export class SortingBatchComponent implements OnInit {
  sortingList: SortingBatch[] = [];
  peelingList: PeelingBatch[] = [];
  operatorList = [
    { id: 'OP001', name: 'John Doe' },
    { id: 'OP002', name: 'Jane Smith' },
    { id: 'OP003', name: 'Ravi Kumar' }
  ];

  sortingForm!: FormGroup;
  editIndex: number | null = null;
  displayedColumns: string[] = [
    'sorting_id',
    'peeling_id',
    'input_weight',
    'category_weights',
    'operator_id',
    'actions'
  ];

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    // Initialize form
    this.sortingForm = this.fb.group({
      peeling_id: ['', Validators.required],
      input_weight: [null, [Validators.required, Validators.min(0.1)]],
      category_weights: this.fb.group({
        cat1: [null, [Validators.required, Validators.min(0)]],
        cat2: [null, [Validators.required, Validators.min(0)]],
        cat3: [null, [Validators.required, Validators.min(0)]],
        cat4: [null, [Validators.required, Validators.min(0)]],
        cat5: [null, [Validators.required, Validators.min(0)]]
      }),
      operator_id: ['', Validators.required]
    });

    // Dummy peeling list
    this.peelingList = [
      { peeling_id: 'PEEL001', kernel_batch_id: 'KRN001', input_weight: 43, cat1_weight: 25, cat6_weight: 10, husk_weight: 8, operator_id: 'OP001' },
      { peeling_id: 'PEEL002', kernel_batch_id: 'KRN002', input_weight: 52, cat1_weight: 30, cat6_weight: 12, husk_weight: 10, operator_id: 'OP002' },
      { peeling_id: 'PEEL003', kernel_batch_id: 'KRN003', input_weight: 47, cat1_weight: 28, cat6_weight: 11, husk_weight: 8, operator_id: 'OP003' }
    ];

    // Dummy sorting list
    this.sortingList = [
      {
        sorting_id: 'SORT001',
        peeling_id: 'PEEL001',
        input_weight: 43,
        category_weights: { cat1: 10, cat2: 8, cat3: 7, cat4: 6, cat5: 5 },
        operator_id: 'OP001'
      }
    ];
  }

  /** Add or Update Sorting Batch */
  submitForm() {
    if (this.sortingForm.invalid) return;
    const formValue = this.sortingForm.value;

    if (this.editIndex !== null) {
      this.sortingList[this.editIndex] = {
        ...this.sortingList[this.editIndex],
        ...formValue
      };
    } else {
      const newBatch: SortingBatch = {
        sorting_id: 'SORT' + (this.sortingList.length + 1).toString().padStart(3, '0'),
        ...formValue
      };
      this.sortingList.push(newBatch);
    }

    this.resetForm();
  }

  editSorting(index: number) {
    this.editIndex = index;
    const batch = this.sortingList[index];
    this.sortingForm.patchValue(batch);
  }

  deleteSorting(index: number) {
    this.sortingList.splice(index, 1);
  }

  resetForm() {
    this.sortingForm.reset();
    this.editIndex = null;
  }

  getOperatorName(id: string): string {
    return this.operatorList.find(op => op.id === id)?.name || '-';
  }

  getCategoryWeightString(weights: { [key: string]: number }): string {
    return Object.entries(weights)
      .map(([k, v]) => `${k}: ${v}`)
      .join(', ');
  }
}
