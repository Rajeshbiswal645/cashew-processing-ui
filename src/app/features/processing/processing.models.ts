export type ProcessingStage = 'BOILING' | 'CUTTING' | 'COMPLETED';
export type ProcessingStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
export type StepFlowKey = 'RCN' | 'BOILING' | 'CUTTING' | 'COMPLETED';
export type StepFlowStatus = 'PENDING' | 'ACTIVE' | 'COMPLETED';
export type PipelineStageKey = 'RCN' | 'BOILING' | 'CUTTING' | 'DRYING' | 'PEELING' | 'SORTING' | 'PACKING';

export interface PipelineJob {
  id: string;
  machineLabel: string;
  machineId: string;
  operator: string;
  inputWeight: number | null;
  outputWeight: number | null;
  kernelWeight: number | null;
  shellWeight: number | null;
  uncutWeight: number | null;
  temperature: number | null;
  startTime: string | null;
  endTime: string | null;
  yieldPercentage: number | null;
  status: ProcessingStatus;
}

export interface PipelineStage {
  id: string;
  key: PipelineStageKey;
  name: string;
  enabled: boolean;
  status: ProcessingStatus;
  jobs: PipelineJob[];
}

export interface ProcessingPipeline {
  id: string;
  batchId: string;
  batchLabel: string;
  title: string;
  stages: PipelineStage[];
}

export interface RcnBatch {
  id: string;
  supplier: string;
  origin: string;
  inputWeight: number;
  receivedDate: string;
}

export interface BoilingStep {
  status: ProcessingStatus;
  inputWeight: number;
  startTime: string | null;
  endTime: string | null;
  temperature: number | null;
  operator: string;
  outputWeight: number | null;
}

export interface CuttingStep {
  status: ProcessingStatus;
  machineId: string;
  operator: string;
  inputWeight: number | null;
  kernelWeight: number | null;
  shellWeight: number | null;
  uncutWeight: number | null;
}

export interface ProcessingRecord {
  id: string;
  rcnBatchId: string;
  currentStage: ProcessingStage;
  status: ProcessingStatus;
  boiling: BoilingStep;
  cutting: CuttingStep;
}

export interface ProcessingDetail extends ProcessingRecord {
  rcnBatch: RcnBatch;
}

export interface BoilingPayload {
  startTime: string;
  endTime: string | null;
  temperature: number;
  operator: string;
}

export interface CuttingPayload {
  machineId: string;
  operator: string;
  kernelWeight: number | null;
  shellWeight: number | null;
  uncutWeight: number | null;
}

export interface ProcessStepSummary {
  key: StepFlowKey;
  label: string;
  status: StepFlowStatus;
  current: boolean;
}
