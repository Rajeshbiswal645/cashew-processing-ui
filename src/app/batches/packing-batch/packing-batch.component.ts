import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PackingBatch, SortingBatch } from '../models/batch.models';

@Component({
  selector: 'app-packing-batch',
  templateUrl: './packing-batch.component.html',
  styleUrls: ['./packing-batch.component.scss']
})
export class PackingBatchComponent implements OnInit {
  packingList: PackingBatch[] = [];
  sortingList: SortingBatch[] = [];
  operatorList = [
    { id: 'OP001', name: 'John Doe' },
    { id: 'OP002', name: 'Jane Smith' },
    { id: 'OP003', name: 'Ravi Kumar' }
  ];

  packingForm!: FormGroup;
  editIndex: number | null = null;
  displayedColumns: string[] = [
    'packing_id',
    'sorting_id',
    'packed_weight',
    'category',
    'packaging_type',
    'packing_date',
    'lot_id',
    'operator_id',
    'actions'
  ];

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    // Initialize form
    this.packingForm = this.fb.group({
      sorting_id: ['', Validators.required],
      packed_weight: [null, [Validators.required, Validators.min(0.1)]],
      category: ['', Validators.required],
      packaging_type: ['', Validators.required],
      packing_date: [new Date(), Validators.required],
      lot_id: ['', Validators.required],
      operator_id: ['', Validators.required]
    });

    // Dummy sorting list
    this.sortingList = [
      {
        sorting_id: 'SORT001',
        peeling_id: 'PEEL001',
        input_weight: 43,
        category_weights: { cat1: 10, cat2: 8, cat3: 7, cat4: 6, cat5: 5 },
        operator_id: 'OP001'
      },
      {
        sorting_id: 'SORT002',
        peeling_id: 'PEEL002',
        input_weight: 52,
        category_weights: { cat1: 15, cat2: 10, cat3: 9, cat4: 8, cat5: 7 },
        operator_id: 'OP002'
      }
    ];

    // Dummy packing list
    this.packingList = [
      {
        packing_id: 'PACK001',
        sorting_id: 'SORT001',
        packed_weight: 20,
        category: 'Cat1',
        packaging_type: 'Vacuum Seal',
        packing_date: new Date('2025-11-05T09:30').toISOString(),
        lot_id: 'LOT1001',
        operator_id: 'OP001'
      },
      {
        packing_id: 'PACK002',
        sorting_id: 'SORT002',
        packed_weight: 25,
        category: 'Cat2',
        packaging_type: 'Pouch',
        packing_date: new Date('2025-11-04T10:00').toISOString(),
        lot_id: 'LOT1002',
        operator_id: 'OP002'
      }
    ];
  }

  /** Add or Update Packing Batch */
  submitForm() {
    if (this.packingForm.invalid) return;
    const formValue = this.packingForm.value;

    if (this.editIndex !== null) {
      // Update existing record
      this.packingList[this.editIndex] = {
        ...this.packingList[this.editIndex],
        ...formValue
      };
    } else {
      // Add new record
      const newBatch: PackingBatch = {
        packing_id: 'PACK' + (this.packingList.length + 1).toString().padStart(3, '0'),
        ...formValue
      };
      this.packingList.push(newBatch);
    }

    this.resetForm();
  }

  editPacking(index: number) {
    this.editIndex = index;
    const batch = this.packingList[index];
    this.packingForm.patchValue({
      ...batch,
      packing_date: new Date(batch.packing_date)
    });
  }

  deletePacking(index: number) {
    this.packingList.splice(index, 1);
  }

  resetForm() {
    this.packingForm.reset({ packing_date: new Date() });
    this.editIndex = null;
  }

  getOperatorName(id: string): string {
    return this.operatorList.find(op => op.id === id)?.name || '-';
  }
}
