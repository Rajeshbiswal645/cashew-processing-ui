import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {
  RcnBatch, BoilingBatch, CuttingBatch, KernelBatch,
  PeelingBatch, SortingBatch, PackingBatch, SalesOrder
} from './models/batch.models';

@Injectable({ providedIn: 'root' })
export class BatchDataService {
  // initial mock RCN data
  private _rcn = new BehaviorSubject<RcnBatch[]>([
    { rcn_id: 'RCN001', supplier: 'Goa Agro', weight: 1000, date: '2025-10-30', status: 'Processed' },
    { rcn_id: 'RCN002', supplier: 'Kerala Nuts', weight: 800, date: '2025-10-31', status: 'Pending' }
  ]);
  private _boiling = new BehaviorSubject<BoilingBatch[]>([]);
  private _cutting = new BehaviorSubject<CuttingBatch[]>([]);
  private _kernel = new BehaviorSubject<KernelBatch[]>([]);
  private _peeling = new BehaviorSubject<PeelingBatch[]>([]);
  private _sorting = new BehaviorSubject<SortingBatch[]>([]);
  private _packing = new BehaviorSubject<PackingBatch[]>([]);
  private _sales = new BehaviorSubject<SalesOrder[]>([]);

  // exposures
  rcn$ = this._rcn.asObservable();
  boiling$ = this._boiling.asObservable();
  cutting$ = this._cutting.asObservable();
  kernel$ = this._kernel.asObservable();
  peeling$ = this._peeling.asObservable();
  sorting$ = this._sorting.asObservable();
  packing$ = this._packing.asObservable();
  sales$ = this._sales.asObservable();

  // Actions: push to next stage
  processToBoiling(rcn: RcnBatch) {
    const newB: BoilingBatch = {
      boiling_id: 'BOIL' + Date.now().toString().slice(-6),
      rcn_id: rcn.rcn_id,
      input_weight: rcn.weight,
      start_time: new Date().toISOString(),
      temp: 95,
      operator_id: 'OP001'
    };
    this._boiling.next([...this._boiling.value, newB]);
  }

  processToCutting(boil: BoilingBatch) {
    const kernelWeight = +(boil.input_weight * 0.30).toFixed(2);
    const shellWeight = +(boil.input_weight * 0.40).toFixed(2);
    const uncutWeight = +(boil.input_weight * 0.10).toFixed(2);
    const newC: CuttingBatch = {
      cutting_id: 'CUT' + Date.now().toString().slice(-6),
      boiling_id: boil.boiling_id,
      machine_id: 'MCH-01',
      input_weight: boil.input_weight,
      kernel_weight: kernelWeight,
      shell_weight: shellWeight,
      uncut_weight: uncutWeight,
      type: 'MANUAL',
      operator_id: 'OP002'
    };
    this._cutting.next([...this._cutting.value, newC]);
  }

  processToKernel(cut: CuttingBatch) {
    const afterBorma = +(cut.kernel_weight * 0.90).toFixed(2);
    const afterHumid = +(afterBorma * 0.95).toFixed(2);
    const newK: KernelBatch = {
      kernel_batch_id: 'KER' + Date.now().toString().slice(-6),
      cutting_id: cut.cutting_id,
      input_weight: cut.kernel_weight,
      after_borma_weight: afterBorma,
      after_humid_weight: afterHumid,
      status: 'READY'
    };
    this._kernel.next([...this._kernel.value, newK]);
  }

  processToPeeling(kernel: KernelBatch) {
    const cat1 = +(kernel.after_humid_weight * 0.60).toFixed(2);
    const cat6 = +(kernel.after_humid_weight * 0.20).toFixed(2);
    const husk = +(kernel.after_humid_weight * 0.10).toFixed(2);
    const newP: PeelingBatch = {
      peeling_id: 'PEEL' + Date.now().toString().slice(-6),
      kernel_batch_id: kernel.kernel_batch_id,
      input_weight: kernel.after_humid_weight,
      cat1_weight: cat1,
      cat6_weight: cat6,
      husk_weight: husk,
      operator_id: 'OP003'
    };
    this._peeling.next([...this._peeling.value, newP]);
  }

  processToSorting(peel: PeelingBatch) {
    const newS: SortingBatch = {
      sorting_id: 'SORT' + Date.now().toString().slice(-6),
      peeling_id: peel.peeling_id,
      input_weight: peel.input_weight,
      category_weights: { W210: peel.cat1_weight * 0.5, W320: peel.cat1_weight * 0.3, Broken: peel.cat1_weight * 0.2 },
      operator_id: 'OP004'
    };
    this._sorting.next([...this._sorting.value, newS]);
  }

 processToPacking(sort: SortingBatch) {
  const newPack: PackingBatch = {
    packing_id: 'PACK' + Date.now().toString().slice(-6),
    sorting_id: sort.sorting_id,
    packed_weight: +(sort.input_weight * 0.9).toFixed(2),
    category: 'W320',
    packaging_type: 'Vacuum',
    packing_date: new Date().toISOString(), // keep as string
    lot_id: 'LOT' + Date.now().toString().slice(-6),
    operator_id: 'OP001' // ✅ added operator_id field
  };

  this._packing.next([...this._packing.value, newPack]);
}

  processToSales(pack: PackingBatch) {
    const newOrder: SalesOrder = {
      so_id: 'SO' + Date.now().toString().slice(-6),
      buyer_id: 'BUY001',
      order_date: new Date().toISOString(),
      status: 'Confirmed',
      total_qty: pack.packed_weight,
      price_per_kg: 850
    };
    this._sales.next([...this._sales.value, newOrder]);
  }
}
