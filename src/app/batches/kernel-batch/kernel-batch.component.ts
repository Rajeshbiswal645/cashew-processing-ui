import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { KernelBatch } from '../models/batch.models';

@Component({
  selector: 'app-kernel-batch',
  templateUrl: './kernel-batch.component.html',
  styleUrls: ['./kernel-batch.component.scss']
})
export class KernelBatchComponent implements OnInit {
  kernelForm!: FormGroup;
  kernelList: KernelBatch[] = [];
  editIndex: number | null = null;

  displayedColumns: string[] = [
    'kernel_batch_id',
    'cutting_id',
    'input_weight',
    'after_borma_weight',
    'after_humid_weight',
    'status',
    'actions'
  ];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.kernelForm = this.fb.group({
      cutting_id: ['', Validators.required],
      input_weight: [null, [Validators.required, Validators.min(0.1)]],
      after_borma_weight: [null, [Validators.required, Validators.min(0)]],
      after_humid_weight: [null, [Validators.required, Validators.min(0)]],
      status: ['Pending', Validators.required]
    });

    // ✅ Dummy initial data
    this.kernelList = [
      {
        kernel_batch_id: 'KRN1001',
        cutting_id: 'CUT1001',
        input_weight: 100,
        after_borma_weight: 95,
        after_humid_weight: 93,
        status: 'Pending'
      },
      {
        kernel_batch_id: 'KRN1002',
        cutting_id: 'CUT1002',
        input_weight: 80,
        after_borma_weight: 77,
        after_humid_weight: 75,
        status: 'Completed'
      }
    ];
  }

  /** Add or update record */
  submitForm(): void {
    if (this.kernelForm.invalid) return;
    const formValue = this.kernelForm.value;

    if (this.editIndex !== null) {
      this.kernelList[this.editIndex] = {
        ...this.kernelList[this.editIndex],
        ...formValue
      };
    } else {
      const newBatch: KernelBatch = {
        kernel_batch_id: 'KRN' + Date.now().toString().slice(-6),
        ...formValue
      };
      this.kernelList = [...this.kernelList, newBatch];
    }
    this.resetForm();
  }

  /** Edit record */
  editKernel(index: number): void {
    this.editIndex = index;
    const batch = this.kernelList[index];
    this.kernelForm.patchValue(batch);
  }

  /** Delete record */
  deleteKernel(index: number): void {
    this.kernelList.splice(index, 1);
    this.kernelList = [...this.kernelList];
  }

  /** Reset form */
  resetForm(): void {
    this.kernelForm.reset({
      status: 'Pending'
    });
    this.editIndex = null;
  }
}
