import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from '../../core/api.service';
import {
  BoilingPayload,
  CuttingPayload,
  PipelineJob,
  PipelineStage,
  ProcessingDetail,
  ProcessingPipeline,
  ProcessingRecord,
  RcnBatch
} from './processing.models';

interface ProcessingJobApiDto {
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
  status: PipelineJob['status'];
}

interface ProcessingStageApiDto {
  id: string;
  key: PipelineStage['key'];
  name: string;
  enabled: boolean;
  status: PipelineStage['status'];
  jobs: ProcessingJobApiDto[];
}

interface ProcessingPipelineApiDto {
  id: string;
  batchId: string;
  batchLabel: string;
  title: string;
  stages: ProcessingStageApiDto[];
}

interface ProcessingRcnBatchApiDto {
  id: string;
  supplier: string;
  origin: string;
  inputWeight: number;
  receivedDate: string;
}

interface ProcessingStageStepApiDto {
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  inputWeight?: number | null;
  startTime?: string | null;
  endTime?: string | null;
  temperature?: number | null;
  operator?: string | null;
  outputWeight?: number | null;
  machineId?: string | null;
  kernelWeight?: number | null;
  shellWeight?: number | null;
  uncutWeight?: number | null;
}

interface ProcessingRecordApiDto {
  id: string;
  rcnBatchId: string;
  currentStage: ProcessingRecord['currentStage'];
  status: ProcessingRecord['status'];
  boiling: ProcessingStageStepApiDto;
  cutting: ProcessingStageStepApiDto;
}

interface ProcessingDetailApiDto extends ProcessingRecordApiDto {
  rcnBatch: ProcessingRcnBatchApiDto;
}

interface ProcessingJobUpdateApiDto {
  machineId?: string;
  operator?: string;
  inputWeight?: number | null;
  outputWeight?: number | null;
  kernelWeight?: number | null;
  shellWeight?: number | null;
  uncutWeight?: number | null;
  temperature?: number | null;
  startTime?: string | null;
  endTime?: string | null;
}

@Injectable({ providedIn: 'root' })
export class ProcessingService {
  private readonly endpoint = 'processing';

  constructor(private readonly api: ApiService) {}

  getPipeline(): Observable<ProcessingPipeline> {
    return this.api.get<ProcessingPipelineApiDto>(`${this.endpoint}/pipeline`).pipe(map((pipeline) => this.toPipeline(pipeline)));
  }

  getRcnBatches(): Observable<RcnBatch[]> {
    return this.api.get<ProcessingRcnBatchApiDto[]>(`${this.endpoint}/rcn-batches`).pipe(
      map((batches) => batches.map((batch) => this.toRcnBatch(batch)))
    );
  }

  updateJob(stageId: string, jobId: string, changes: Partial<PipelineJob>): Observable<ProcessingPipeline> {
    return this.api
      .put<ProcessingPipelineApiDto>(`${this.endpoint}/pipeline/stages/${stageId}/jobs/${jobId}`, this.toJobUpdatePayload(changes))
      .pipe(map((pipeline) => this.toPipeline(pipeline)));
  }

  startJob(stageId: string, jobId: string, changes: Partial<PipelineJob>): Observable<ProcessingPipeline> {
    return this.api
      .post<ProcessingPipelineApiDto>(`${this.endpoint}/pipeline/stages/${stageId}/jobs/${jobId}/start`, this.toJobUpdatePayload(changes))
      .pipe(map((pipeline) => this.toPipeline(pipeline)));
  }

  completeJob(stageId: string, jobId: string, changes: Partial<PipelineJob>): Observable<ProcessingPipeline> {
    return this.api
      .post<ProcessingPipelineApiDto>(`${this.endpoint}/pipeline/stages/${stageId}/jobs/${jobId}/complete`, this.toJobUpdatePayload(changes))
      .pipe(map((pipeline) => this.toPipeline(pipeline)));
  }

  startNewProcess(batchId: string): Observable<ProcessingPipeline> {
    return this.api
      .post<ProcessingPipelineApiDto>(`${this.endpoint}/processes`, { batchId })
      .pipe(map((pipeline) => this.toPipeline(pipeline)));
  }

  getProcesses(): Observable<ProcessingRecord[]> {
    return this.api
      .get<ProcessingRecordApiDto[]>(`${this.endpoint}/processes`)
      .pipe(map((records) => records.map((record) => this.toProcessRecord(record))));
  }

  getProcessById(processId: string): Observable<ProcessingDetail | undefined> {
    return this.api
      .get<ProcessingDetailApiDto>(`${this.endpoint}/processes/${processId}`)
      .pipe(map((process) => this.toProcessDetail(process)));
  }

  startCurrentStep(processId: string): Observable<ProcessingRecord> {
    return this.api
      .post<ProcessingRecordApiDto>(`${this.endpoint}/processes/${processId}/start-current-step`, {})
      .pipe(map((record) => this.toProcessRecord(record)));
  }

  startBoiling(processId: string, payload: BoilingPayload): Observable<ProcessingRecord> {
    return this.api
      .post<ProcessingRecordApiDto>(`${this.endpoint}/processes/${processId}/boiling/start`, this.toBoilingPayload(payload))
      .pipe(map((record) => this.toProcessRecord(record)));
  }

  completeBoiling(processId: string, payload: BoilingPayload): Observable<ProcessingRecord> {
    return this.api
      .post<ProcessingRecordApiDto>(`${this.endpoint}/processes/${processId}/boiling/complete`, this.toBoilingPayload(payload))
      .pipe(map((record) => this.toProcessRecord(record)));
  }

  startCutting(processId: string, payload: CuttingPayload): Observable<ProcessingRecord> {
    return this.api
      .post<ProcessingRecordApiDto>(`${this.endpoint}/processes/${processId}/cutting/start`, this.toCuttingPayload(payload))
      .pipe(map((record) => this.toProcessRecord(record)));
  }

  completeCutting(processId: string, payload: CuttingPayload): Observable<ProcessingRecord> {
    return this.api
      .post<ProcessingRecordApiDto>(`${this.endpoint}/processes/${processId}/cutting/complete`, this.toCuttingPayload(payload))
      .pipe(map((record) => this.toProcessRecord(record)));
  }

  private toPipeline(dto: ProcessingPipelineApiDto): ProcessingPipeline {
    return {
      id: dto.id,
      batchId: dto.batchId,
      batchLabel: dto.batchLabel,
      title: dto.title,
      stages: (dto.stages ?? []).map((stage) => this.toStage(stage))
    };
  }

  private toStage(dto: ProcessingStageApiDto): PipelineStage {
    return {
      id: dto.id,
      key: dto.key,
      name: dto.name,
      enabled: !!dto.enabled,
      status: dto.status,
      jobs: (dto.jobs ?? []).map((job) => this.toJob(job))
    };
  }

  private toJob(dto: ProcessingJobApiDto): PipelineJob {
    return {
      id: dto.id,
      machineLabel: dto.machineLabel,
      machineId: dto.machineId ?? '',
      operator: dto.operator ?? '',
      inputWeight: this.toNumber(dto.inputWeight),
      outputWeight: this.toNumber(dto.outputWeight),
      kernelWeight: this.toNumber(dto.kernelWeight),
      shellWeight: this.toNumber(dto.shellWeight),
      uncutWeight: this.toNumber(dto.uncutWeight),
      temperature: this.toNumber(dto.temperature),
      startTime: this.toDateTimeInput(dto.startTime),
      endTime: this.toDateTimeInput(dto.endTime),
      yieldPercentage: this.toNumber(dto.yieldPercentage),
      status: dto.status
    };
  }

  private toRcnBatch(dto: ProcessingRcnBatchApiDto): RcnBatch {
    return {
      id: dto.id,
      supplier: dto.supplier,
      origin: dto.origin,
      inputWeight: Number(dto.inputWeight ?? 0),
      receivedDate: dto.receivedDate ?? ''
    };
  }

  private toProcessRecord(dto: ProcessingRecordApiDto): ProcessingRecord {
    return {
      id: dto.id,
      rcnBatchId: dto.rcnBatchId,
      currentStage: dto.currentStage === 'BOILING' || dto.currentStage === 'CUTTING' ? dto.currentStage : 'COMPLETED',
      status: dto.status,
      boiling: {
        status: dto.boiling.status,
        inputWeight: Number(dto.boiling.inputWeight ?? 0),
        startTime: this.toDateTimeInput(dto.boiling.startTime),
        endTime: this.toDateTimeInput(dto.boiling.endTime),
        temperature: this.toNumber(dto.boiling.temperature),
        operator: dto.boiling.operator ?? '',
        outputWeight: this.toNumber(dto.boiling.outputWeight)
      },
      cutting: {
        status: dto.cutting.status,
        machineId: dto.cutting.machineId ?? '',
        operator: dto.cutting.operator ?? '',
        inputWeight: this.toNumber(dto.cutting.inputWeight),
        kernelWeight: this.toNumber(dto.cutting.kernelWeight),
        shellWeight: this.toNumber(dto.cutting.shellWeight),
        uncutWeight: this.toNumber(dto.cutting.uncutWeight)
      }
    };
  }

  private toProcessDetail(dto: ProcessingDetailApiDto): ProcessingDetail {
    return {
      ...this.toProcessRecord(dto),
      rcnBatch: this.toRcnBatch(dto.rcnBatch)
    };
  }

  private toJobUpdatePayload(changes: Partial<PipelineJob>): ProcessingJobUpdateApiDto {
    return {
      machineId: changes.machineId ?? undefined,
      operator: changes.operator ?? undefined,
      inputWeight: this.toNullableNumber(changes.inputWeight),
      outputWeight: this.toNullableNumber(changes.outputWeight),
      kernelWeight: this.toNullableNumber(changes.kernelWeight),
      shellWeight: this.toNullableNumber(changes.shellWeight),
      uncutWeight: this.toNullableNumber(changes.uncutWeight),
      temperature: this.toNullableNumber(changes.temperature),
      startTime: changes.startTime ?? undefined,
      endTime: changes.endTime ?? undefined
    };
  }

  private toBoilingPayload(payload: BoilingPayload): ProcessingJobUpdateApiDto {
    return {
      operator: payload.operator,
      temperature: Number(payload.temperature),
      startTime: payload.startTime,
      endTime: payload.endTime
    };
  }

  private toCuttingPayload(payload: CuttingPayload): ProcessingJobUpdateApiDto {
    return {
      machineId: payload.machineId,
      operator: payload.operator,
      kernelWeight: this.toNullableNumber(payload.kernelWeight),
      shellWeight: this.toNullableNumber(payload.shellWeight),
      uncutWeight: this.toNullableNumber(payload.uncutWeight)
    };
  }

  private toDateTimeInput(value?: string | null): string | null {
    return value ? value.slice(0, 16) : null;
  }

  private toNumber(value: number | null | undefined): number | null {
    return value === null || value === undefined ? null : Number(value);
  }

  private toNullableNumber(value: number | null | undefined): number | null | undefined {
    return value === undefined ? undefined : value === null ? null : Number(value);
  }
}
