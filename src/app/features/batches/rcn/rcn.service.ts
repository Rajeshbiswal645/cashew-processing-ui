import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from '../../../core/api.service';
import { RcnBatch, RcnBatchFormValue, RcnVendor, RcnStatus } from './rcn.models';

interface RcnBatchApiDto {
  id?: number;
  vendorId: string;
  vendorName?: string;
  contract?: string | null;
  origin: string;
  truckId?: string;
  driverName?: string;
  driverPhone?: string;
  grossWeight: number;
  tareWeight: number;
  netWeight?: number;
  moistureBefore?: number | null;
  moistureAfter?: number | null;
  requiresDrying?: boolean;
  procurementDate?: string;
  remarks?: string;
  status: RcnStatus;
}

interface RcnVendorApiDto {
  id: string;
  name: string;
  origins: string[];
  contracts: string[];
}

@Injectable({ providedIn: 'root' })
export class RcnService {
  private readonly batchEndpoint = 'rcn-batches';

  constructor(private readonly api: ApiService) {}

  getVendors(): Observable<RcnVendor[]> {
    return this.api.get<RcnVendorApiDto[]>(`${this.batchEndpoint}/vendors`).pipe(
      map((vendors) =>
        vendors.map((vendor) => ({
          id: vendor.id,
          name: vendor.name,
          origins: vendor.origins ?? [],
          contracts: vendor.contracts ?? []
        }))
      )
    );
  }

  getBatches(filters?: { search?: string; status?: 'All' | RcnStatus; procurementDate?: string | null }): Observable<RcnBatch[]> {
    return this.api
      .get<RcnBatchApiDto[]>(this.batchEndpoint, {
        search: filters?.search,
        status: filters?.status === 'All' ? undefined : filters?.status,
        procurementDate: filters?.procurementDate || undefined
      })
      .pipe(map((batches) => batches.map((batch) => this.toBatch(batch))));
  }

  createBatch(payload: RcnBatchFormValue): Observable<RcnBatch> {
    return this.api
      .post<RcnBatchApiDto>(this.batchEndpoint, this.toApiPayload(payload))
      .pipe(map((batch) => this.toBatch(batch)));
  }

  updateBatch(id: string, payload: RcnBatchFormValue): Observable<RcnBatch> {
    return this.api
      .put<RcnBatchApiDto>(`${this.batchEndpoint}/${id}`, this.toApiPayload(payload))
      .pipe(map((batch) => this.toBatch(batch)));
  }

  deleteBatch(id: string): Observable<void> {
    return this.api.delete<void>(`${this.batchEndpoint}/${id}`);
  }

  private toApiPayload(payload: RcnBatchFormValue): RcnBatchApiDto {
    return {
      id: payload.id ? Number(payload.id) : undefined,
      vendorId: payload.vendorId,
      contract: payload.contract ?? null,
      origin: payload.origin,
      truckId: payload.truckId.trim(),
      driverName: payload.driverName.trim(),
      driverPhone: payload.driverPhone.trim(),
      grossWeight: Number(payload.grossWeight),
      tareWeight: Number(payload.tareWeight),
      moistureBefore: payload.moistureBefore === null || payload.moistureBefore === undefined ? null : Number(payload.moistureBefore),
      moistureAfter: payload.moistureAfter === null || payload.moistureAfter === undefined ? null : Number(payload.moistureAfter),
      requiresDrying: !!payload.requiresDrying,
      procurementDate: payload.procurementDate,
      remarks: payload.remarks.trim(),
      status: payload.status ?? 'Pending QC'
    };
  }

  private toBatch(dto: RcnBatchApiDto): RcnBatch {
    const grossWeight = Number(dto.grossWeight ?? 0);
    const tareWeight = Number(dto.tareWeight ?? 0);

    return {
      id: String(dto.id ?? ''),
      vendorId: dto.vendorId,
      vendorName: dto.vendorName ?? dto.vendorId,
      contract: dto.contract ?? undefined,
      origin: dto.origin,
      truckId: dto.truckId ?? '',
      driverName: dto.driverName ?? '',
      driverPhone: dto.driverPhone ?? '',
      grossWeight,
      tareWeight,
      netWeight: Number(dto.netWeight ?? Math.max(grossWeight - tareWeight, 0)),
      moistureBefore: Number(dto.moistureBefore ?? 0),
      moistureAfter: dto.moistureAfter === null || dto.moistureAfter === undefined ? null : Number(dto.moistureAfter),
      requiresDrying: !!dto.requiresDrying,
      procurementDate: dto.procurementDate ?? '',
      remarks: dto.remarks ?? '',
      status: dto.status
    };
  }
}
