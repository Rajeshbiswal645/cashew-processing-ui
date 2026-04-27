export type QcStatus = 'PENDING' | 'PASSED' | 'FAILED' | 'DRYING_REQUIRED';
export type QualityGrade = 'A' | 'B' | 'C';

export interface QcBatch {
  id: string;
  vendor: string;
  origin: string;
  netWeight: number;
  procurementDate: string;
  moistureBefore: number | null;
  moistureAfter: number | null;
  foreignMatter: number | null;
  qualityGrade: QualityGrade | null;
  remarks: string;
  status: QcStatus;
  requiresDrying: boolean;
}

export interface QcInspectionPayload {
  moistureBefore: number;
  moistureAfter: number | null;
  foreignMatter: number | null;
  qualityGrade: QualityGrade;
  requiresDrying: boolean;
  remarks: string;
  approved: boolean;
}

export interface QcFilters {
  search: string;
  status: 'ALL' | 'PENDING' | 'PASSED' | 'FAILED';
  date: string | null;
}
