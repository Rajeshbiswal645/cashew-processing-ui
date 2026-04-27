import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from '../../core/api.service';
import {
  BatchTraceStep,
  InventoryFilters,
  InventoryLedgerEntry,
  InventoryRecord
} from './inventory.models';

interface InventoryRecordApiDto {
  batchId: string;
  stage: InventoryRecord['stage'];
  category: InventoryRecord['category'];
  quantity: number;
  location: string;
  status: InventoryRecord['status'];
  updatedOn: string;
}

interface InventoryLedgerEntryApiDto {
  date: string;
  batchId: string;
  stage: InventoryLedgerEntry['stage'];
  movementType: InventoryLedgerEntry['movementType'];
  quantity: number;
  reference: string;
  category: InventoryLedgerEntry['category'];
}

interface InventoryTraceStepApiDto {
  stage: BatchTraceStep['stage'];
  date: string;
  quantity: number;
  status: string;
}

@Injectable({ providedIn: 'root' })
export class InventoryService {
  private readonly endpoint = 'inventory';

  constructor(private readonly api: ApiService) {}

  getInventory(filters: InventoryFilters): Observable<InventoryRecord[]> {
    return this.api
      .get<InventoryRecordApiDto[]>(`${this.endpoint}/summary`, this.toParams(filters))
      .pipe(map((records) => records.map((record) => this.toRecord(record))));
  }

  getLedger(filters: InventoryFilters): Observable<InventoryLedgerEntry[]> {
    return this.api
      .get<InventoryLedgerEntryApiDto[]>(`${this.endpoint}/ledger`, this.toParams(filters))
      .pipe(map((entries) => entries.map((entry) => this.toLedgerEntry(entry))));
  }

  getBatchTrace(batchId: string): Observable<BatchTraceStep[]> {
    return this.api
      .get<InventoryTraceStepApiDto[]>(`${this.endpoint}/trace/${encodeURIComponent(batchId)}`)
      .pipe(map((steps) => steps.map((step) => this.toTraceStep(step))));
  }

  private toParams(filters: InventoryFilters): Record<string, string | null> {
    return {
      tab: filters.tab,
      stage: filters.stage === 'ALL' ? null : filters.stage,
      category: filters.category === 'ALL' ? null : filters.category,
      startDate: filters.startDate,
      endDate: filters.endDate,
      search: filters.search || null
    };
  }

  private toRecord(dto: InventoryRecordApiDto): InventoryRecord {
    return {
      batchId: dto.batchId,
      stage: dto.stage,
      category: dto.category,
      quantity: Number(dto.quantity ?? 0),
      location: dto.location,
      status: dto.status,
      updatedOn: dto.updatedOn
    };
  }

  private toLedgerEntry(dto: InventoryLedgerEntryApiDto): InventoryLedgerEntry {
    return {
      date: dto.date,
      batchId: dto.batchId,
      stage: dto.stage,
      movementType: dto.movementType,
      quantity: Number(dto.quantity ?? 0),
      reference: dto.reference,
      category: dto.category
    };
  }

  private toTraceStep(dto: InventoryTraceStepApiDto): BatchTraceStep {
    return {
      stage: dto.stage,
      date: dto.date,
      quantity: Number(dto.quantity ?? 0),
      status: dto.status
    };
  }
}
