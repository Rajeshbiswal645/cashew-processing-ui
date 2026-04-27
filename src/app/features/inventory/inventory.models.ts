export type InventoryStage = 'RCN' | 'DRYING' | 'BOILING' | 'CUTTING' | 'PACKING';
export type InventoryCategory = 'RAW' | 'KERNEL' | 'FINISHED' | 'BYPRODUCTS';
export type InventoryStatus = 'AVAILABLE' | 'HOLD' | 'RESERVED' | 'DISPATCHED';
export type InventoryTab = 'RCN_STOCK' | 'KERNEL_STOCK' | 'FINISHED_GOODS' | 'BYPRODUCTS';
export type InventoryViewMode = 'SUMMARY' | 'LEDGER';

export interface InventoryRecord {
  batchId: string;
  stage: InventoryStage;
  category: InventoryCategory;
  quantity: number;
  location: string;
  status: InventoryStatus;
  updatedOn: string;
}

export interface InventoryLedgerEntry {
  date: string;
  batchId: string;
  stage: InventoryStage;
  movementType: 'IN' | 'OUT';
  quantity: number;
  reference: string;
  category: InventoryCategory;
}

export interface BatchTraceStep {
  stage: 'RCN' | 'QC' | 'DRYING' | 'BOILING' | 'CUTTING' | 'PACKING' | 'SALES';
  date: string;
  quantity: number;
  status: string;
}

export interface InventoryFilters {
  stage: 'ALL' | InventoryStage;
  category: 'ALL' | InventoryCategory;
  startDate: string | null;
  endDate: string | null;
  search: string;
  tab: InventoryTab;
}
