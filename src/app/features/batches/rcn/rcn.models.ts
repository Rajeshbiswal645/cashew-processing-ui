export type RcnStatus = 'Pending QC' | 'Approved' | 'Rejected';

export interface RcnVendor {
  id: string;
  name: string;
  origins: string[];
  contracts: string[];
}

export interface RcnBatch {
  id: string;
  vendorId: string;
  vendorName: string;
  contract?: string;
  origin: string;
  truckId: string;
  driverName: string;
  driverPhone: string;
  grossWeight: number;
  tareWeight: number;
  netWeight: number;
  moistureBefore: number;
  moistureAfter?: number | null;
  requiresDrying: boolean;
  procurementDate: string;
  remarks: string;
  status: RcnStatus;
}

export interface RcnBatchFormValue {
  id?: string;
  vendorId: string;
  contract?: string | null;
  origin: string;
  truckId: string;
  driverName: string;
  driverPhone: string;
  grossWeight: number;
  tareWeight: number;
  moistureBefore: number;
  moistureAfter?: number | null;
  requiresDrying: boolean;
  procurementDate: string;
  remarks: string;
  status?: RcnStatus;
}
