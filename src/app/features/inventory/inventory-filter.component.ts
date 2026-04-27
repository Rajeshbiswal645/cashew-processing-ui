import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { InventoryCategory, InventoryFilters, InventoryStage, InventoryViewMode } from './inventory.models';

@Component({
  selector: 'app-inventory-filter',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonToggleModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
  ],
  templateUrl: './inventory-filter.component.html',
  styleUrls: ['./inventory-filter.component.scss']
})
export class InventoryFilterComponent {
  @Input() viewMode: InventoryViewMode = 'SUMMARY';

  @Output() filtersChange = new EventEmitter<Omit<InventoryFilters, 'tab'>>();
  @Output() viewModeChange = new EventEmitter<InventoryViewMode>();

  readonly stageOptions: Array<'ALL' | InventoryStage> = ['ALL', 'RCN', 'DRYING', 'BOILING', 'CUTTING', 'PACKING'];
  readonly categoryOptions: Array<'ALL' | InventoryCategory> = ['ALL', 'RAW', 'KERNEL', 'FINISHED', 'BYPRODUCTS'];

  readonly form = this.formBuilder.group({
    stage: ['ALL' as 'ALL' | InventoryStage],
    category: ['ALL' as 'ALL' | InventoryCategory],
    startDate: [null as Date | null],
    endDate: [null as Date | null],
    search: ['']
  });

  constructor(private readonly formBuilder: FormBuilder) {
    this.form.valueChanges.subscribe(() => this.emitFilters());
    this.emitFilters();
  }

  changeViewMode(mode: InventoryViewMode): void {
    this.viewModeChange.emit(mode);
  }

  private emitFilters(): void {
    const raw = this.form.getRawValue();

    this.filtersChange.emit({
      stage: raw.stage ?? 'ALL',
      category: raw.category ?? 'ALL',
      startDate: raw.startDate ? new Date(raw.startDate).toISOString().slice(0, 10) : null,
      endDate: raw.endDate ? new Date(raw.endDate).toISOString().slice(0, 10) : null,
      search: raw.search?.trim() ?? ''
    });
  }
}
