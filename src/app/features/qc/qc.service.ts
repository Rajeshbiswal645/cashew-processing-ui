import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from '../../core/api.service';
import { QcBatch, QcFilters, QcInspectionPayload, QcStatus, QualityGrade } from './qc.models';

interface QcBatchApiDto {
  id: number;
  vendor: string;
  origin: string;
  netWeight: number;
  procurementDate: string;
  moistureBefore: number | null;
  moistureAfter: number | null;
  foreignMatter: number | null;
  qualityGrade: QualityGrade | null;
  remarks: string | null;
  status: QcStatus;
  requiresDrying: boolean;
}

interface QcInspectionApiPayload {
  moistureBefore: number;
  moistureAfter: number | null;
  foreignMatter: number | null;
  qualityGrade: QualityGrade;
  requiresDrying: boolean;
  remarks: string;
  approved: boolean;
}

@Injectable({ providedIn: 'root' })
export class QcService {
  readonly moistureThreshold = 10;
  private readonly endpoint = 'qc-inspections';

  constructor(private readonly api: ApiService) {}

  getBatches(filters?: QcFilters): Observable<QcBatch[]> {
    return this.api
      .get<QcBatchApiDto[]>(this.endpoint, {
        search: filters?.search,
        status: filters?.status === 'ALL' ? undefined : filters?.status,
        date: filters?.date ?? undefined
      })
      .pipe(map((batches) => batches.map((batch) => this.toBatch(batch))));
  }

  getBatch(id: string): Observable<QcBatch | undefined> {
    return this.api.get<QcBatchApiDto>(`${this.endpoint}/${id}`).pipe(map((batch) => this.toBatch(batch)));
  }

  getDryingRequiredBatches(): Observable<QcBatch[]> {
    return this.api
      .get<QcBatchApiDto[]>(`${this.endpoint}/drying-required`)
      .pipe(map((batches) => batches.map((batch) => this.toBatch(batch))));
  }

  inspectBatch(batchId: string, payload: QcInspectionPayload): Observable<QcBatch> {
    return this.api
      .put<QcBatchApiDto>(`${this.endpoint}/${batchId}`, this.toApiPayload(payload))
      .pipe(map((batch) => this.toBatch(batch)));
  }

  private toApiPayload(payload: QcInspectionPayload): QcInspectionApiPayload {
    return {
      moistureBefore: Number(payload.moistureBefore),
      moistureAfter: this.normalizeNullableNumber(payload.moistureAfter),
      foreignMatter: this.normalizeNullableNumber(payload.foreignMatter),
      qualityGrade: payload.qualityGrade,
      requiresDrying: Boolean(payload.requiresDrying),
      remarks: payload.remarks.trim(),
      approved: Boolean(payload.approved)
    };
  }

  private toBatch(dto: QcBatchApiDto): QcBatch {
    return {
      id: String(dto.id),
      vendor: dto.vendor,
      origin: dto.origin,
      netWeight: Number(dto.netWeight ?? 0),
      procurementDate: dto.procurementDate ?? '',
      moistureBefore: dto.moistureBefore === null || dto.moistureBefore === undefined ? null : Number(dto.moistureBefore),
      moistureAfter: dto.moistureAfter === null || dto.moistureAfter === undefined ? null : Number(dto.moistureAfter),
      foreignMatter: dto.foreignMatter === null || dto.foreignMatter === undefined ? null : Number(dto.foreignMatter),
      qualityGrade: dto.qualityGrade ?? null,
      remarks: dto.remarks ?? '',
      status: dto.status,
      requiresDrying: !!dto.requiresDrying
    };
  }

  private normalizeNullableNumber(value: number | null): number | null {
    return value === null || value === undefined ? null : Number(value);
  }
}
