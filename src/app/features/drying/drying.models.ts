export type DryingStatus = 'IN_PROGRESS' | 'COMPLETED';

export interface DryingBatch {
  id: string;
  rcnId: string;
  vendor: string;
  weightBeforeDrying: number;
  weightAfterDrying: number | null;
  moistureBefore: number;
  moistureAfter: number | null;
  dryingStartDate: string | null;
  dryingEndDate: string | null;
  numberOfCycles: number | null;
  status: DryingStatus;
}

export interface DryingCreatePayload {
  rcnId: string;
  weightBeforeDrying: number;
  moistureBefore: number;
}

export interface DryingCompletePayload {
  weightAfterDrying: number;
  moistureAfter: number;
  dryingStartDate: string;
  dryingEndDate: string;
  numberOfCycles: number;
}

export interface DryingCandidate {
  rcnId: string;
  vendor: string;
  weightBeforeDrying: number;
  moistureBefore: number;
}
