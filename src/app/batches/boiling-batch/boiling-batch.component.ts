import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BoilingBatch, CuttingBatch } from '../models/batch.models';
import { BatchDataService } from '../batch-data.service';

@Component({
  selector: 'app-boiling-batch',
  templateUrl: './boiling-batch.component.html',
  styleUrls: ['./boiling-batch.component.scss']
})
export class BoilingBatchComponent {
  boilingList: BoilingBatch[] = [];
  cuttingList: CuttingBatch[] = [];
  boilingForm!: FormGroup;
  editIndex: number | null = null;

  operatorList = [
    { id: 'OP01', name: 'Ramesh Kumar' },
    { id: 'OP02', name: 'Sita Devi' },
    { id: 'OP03', name: 'John Mathew' }
  ];

  displayedColumns = [
    'boiling_id', 'rcn_id', 'input_weight', 'start_time',
    'end_time', 'temp', 'operator_id', 'actions'
  ];

  constructor(private fb: FormBuilder, private svc: BatchDataService) {}

  ngOnInit() {
    this.boilingForm = this.fb.group({
      boiling_id: [''],
      rcn_id: ['', Validators.required],
      input_weight: [0, Validators.required],
      start_time: ['', Validators.required],
      end_time: ['', Validators.required],
      temp: [0, Validators.required],
      operator_id: ['', Validators.required]
    });

    this.svc.boiling$.subscribe(v => this.boilingList = v);
    this.svc.cutting$.subscribe(v => this.cuttingList = v);
  }

  getOperatorName(id: string): string {
    return this.operatorList.find(o => o.id === id)?.name || 'Unknown';
  }

  submitForm() {
    if (this.boilingForm.valid) {
      const formValue = { ...this.boilingForm.value };

      if (this.editIndex !== null) {
        this.boilingList[this.editIndex] = formValue;
        this.editIndex = null;
      } else {
        formValue.boiling_id = 'BOIL' + Date.now().toString().slice(-5);
        this.boilingList.push(formValue);
      }

      (this.svc as any)._boiling.next([...this.boilingList]);
      this.resetForm();
    }
  }

  editBoiling(index: number) {
    this.editIndex = index;
    this.boilingForm.patchValue(this.boilingList[index]);
  }

  deleteBoiling(index: number) {
    this.boilingList.splice(index, 1);
    (this.svc as any)._boiling.next([...this.boilingList]);
  }

  startCutting(boil: BoilingBatch) {
    this.svc.processToCutting(boil);
  }

  resetForm() {
    this.boilingForm.reset();
    this.editIndex = null;
  }
}
