import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BoilingBatch, CuttingBatch } from '../models/batch.models';

@Component({
  selector: 'app-cutting-batch',
  templateUrl: './cutting-batch.component.html',
  styleUrls: ['./cutting-batch.component.scss']
})
export class CuttingBatchComponent implements OnInit {
  cuttingForm!: FormGroup;
  cuttingList: CuttingBatch[] = [];
  editIndex: number | null = null;

  operatorList = [
    { id: 'OP001', name: 'John Doe' },
    { id: 'OP002', name: 'Jane Smith' },
    { id: 'OP003', name: 'Ravi Kumar' }
  ];

  displayedColumns: string[] = [
    'cutting_id',
    'boiling_id',
    'machine_id',
    'input_weight',
    'kernel_weight',
    'shell_weight',
    'uncut_weight',
    'type',
    'operator_id',
    'actions'
  ];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.cuttingForm = this.fb.group({
      boiling_id: ['', Validators.required],
      machine_id: ['', Validators.required],
      input_weight: [null, [Validators.required, Validators.min(0.1)]],
      kernel_weight: [null, [Validators.required, Validators.min(0)]],
      shell_weight: [null, [Validators.required, Validators.min(0)]],
      uncut_weight: [null, [Validators.required, Validators.min(0)]],
      type: ['MANUAL', Validators.required],
      operator_id: ['', Validators.required]
    });

    // ✅ Dummy initial data
    this.cuttingList = [
      {
        cutting_id: 'CUT1001',
        boiling_id: 'BOIL1001',
        machine_id: 'MCH-01',
        input_weight: 100,
        kernel_weight: 30,
        shell_weight: 40,
        uncut_weight: 10,
        type: 'MANUAL',
        operator_id: 'OP001'
      },
      {
        cutting_id: 'CUT1002',
        boiling_id: 'BOIL1002',
        machine_id: 'MCH-02',
        input_weight: 80,
        kernel_weight: 25,
        shell_weight: 35,
        uncut_weight: 8,
        type: 'MACHINE',
        operator_id: 'OP002'
      }
    ];
  }

  /** Add or update record */
  submitForm(): void {
    if (this.cuttingForm.invalid) return;

    const formValue = this.cuttingForm.value;

    if (this.editIndex !== null) {
      // ✅ Update existing batch
      this.cuttingList[this.editIndex] = {
        ...this.cuttingList[this.editIndex],
        ...formValue
      };
    } else {
      // ✅ Add new batch
      const newBatch: CuttingBatch = {
        cutting_id: 'CUT' + Date.now().toString().slice(-6),
        ...formValue
      };
      this.cuttingList = [...this.cuttingList, newBatch];
    }

    this.resetForm();
  }

  /** Edit record */
  editCutting(index: number): void {
    this.editIndex = index;
    const batch = this.cuttingList[index];
    this.cuttingForm.patchValue(batch);
  }

  /** Delete record */
  deleteCutting(index: number): void {
    this.cuttingList.splice(index, 1);
    this.cuttingList = [...this.cuttingList];
  }

  /** Reset form */
  resetForm(): void {
    this.cuttingForm.reset({
      type: 'MANUAL'
    });
    this.editIndex = null;
  }

  /** Get operator name */
  getOperatorName(id: string): string {
    return this.operatorList.find(op => op.id === id)?.name || '-';
  }
}
