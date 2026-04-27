import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { QcService } from '../qc/qc.service';
import { DryingBatch, DryingCandidate, DryingCompletePayload, DryingCreatePayload } from './drying.models';

@Injectable({ providedIn: 'root' })
export class DryingService {
  private readonly batchesSubject = new BehaviorSubject<DryingBatch[]>(this.createMockBatches());
  readonly batches$ = this.batchesSubject.asObservable();

  constructor(private readonly qcService: QcService) {}

  getDryingBatches(): Observable<DryingBatch[]> {
    return of(this.batchesSubject.value).pipe(delay(450));
  }

  getDryingCandidates(): Observable<DryingCandidate[]> {
    return this.qcService.getDryingRequiredBatches().pipe(
      map((qcBatches) => {
        const linkedRcnIds = new Set(this.batchesSubject.value.map((batch) => batch.rcnId));

        return qcBatches
          .filter((batch) => !linkedRcnIds.has(batch.id))
          .map((batch) => ({
            rcnId: batch.id,
            vendor: batch.vendor,
            weightBeforeDrying: batch.netWeight,
            moistureBefore: batch.moistureBefore ?? 0
          }));
      })
    );
  }

  createDryingBatch(payload: DryingCreatePayload): Observable<DryingBatch> {
    const candidate = this.createCandidateSnapshot(payload.rcnId);
    const created: DryingBatch = {
      id: `DRY-${String(Date.now()).slice(-6)}`,
      rcnId: payload.rcnId,
      vendor: candidate?.vendor ?? 'Unknown Vendor',
      weightBeforeDrying: Number(payload.weightBeforeDrying),
      weightAfterDrying: null,
      moistureBefore: Number(payload.moistureBefore),
      moistureAfter: null,
      dryingStartDate: null,
      dryingEndDate: null,
      numberOfCycles: null,
      status: 'IN_PROGRESS'
    };

    this.batchesSubject.next([created, ...this.batchesSubject.value]);
    return of(created).pipe(delay(600));
  }

  completeDryingBatch(batchId: string, payload: DryingCompletePayload): Observable<DryingBatch> {
    const current = this.batchesSubject.value.find((batch) => batch.id === batchId);

    if (!current) {
      throw new Error(`Drying batch ${batchId} not found`);
    }

    const completed: DryingBatch = {
      ...current,
      weightAfterDrying: Number(payload.weightAfterDrying),
      moistureAfter: Number(payload.moistureAfter),
      dryingStartDate: payload.dryingStartDate,
      dryingEndDate: payload.dryingEndDate,
      numberOfCycles: Number(payload.numberOfCycles),
      status: 'COMPLETED'
    };

    this.batchesSubject.next(
      this.batchesSubject.value.map((batch) => (batch.id === batchId ? completed : batch))
    );

    return of(completed).pipe(delay(600));
  }

  private createCandidateSnapshot(rcnId: string): DryingCandidate | undefined {
    let snapshot: DryingCandidate | undefined;

    this.qcService
      .getBatch(rcnId)
      .subscribe((batch) => {
        if (!batch) {
          return;
        }

        snapshot = {
          rcnId: batch.id,
          vendor: batch.vendor,
          weightBeforeDrying: batch.netWeight,
          moistureBefore: batch.moistureBefore ?? 0
        };
      })
      .unsubscribe();

    return snapshot;
  }

  private createMockBatches(): DryingBatch[] {
    return [
      {
        id: 'DRY-260401',
        rcnId: 'RCN-260404',
        vendor: 'Rajesh Cashews',
        weightBeforeDrying: 16590,
        weightAfterDrying: null,
        moistureBefore: 10.9,
        moistureAfter: null,
        dryingStartDate: null,
        dryingEndDate: null,
        numberOfCycles: null,
        status: 'IN_PROGRESS'
      },
      {
        id: 'DRY-260305',
        rcnId: 'RCN-260315',
        vendor: 'Oceanic Commodities',
        weightBeforeDrying: 18240,
        weightAfterDrying: 17610,
        moistureBefore: 11.7,
        moistureAfter: 8.4,
        dryingStartDate: '2026-04-03',
        dryingEndDate: '2026-04-04',
        numberOfCycles: 3,
        status: 'COMPLETED'
      }
    ];
  }
}
