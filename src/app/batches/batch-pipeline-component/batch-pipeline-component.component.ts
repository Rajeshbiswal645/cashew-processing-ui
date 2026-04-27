import { Component } from '@angular/core';
import { BatchDataService } from '../batch-data.service';

@Component({
  selector: 'app-batch-pipeline',
  templateUrl: './batch-pipeline.component.html',
  styleUrls: ['./batch-pipeline.component.scss']
})
export class BatchPipelineComponent {
expandedStage: string | null = 'rcn';
  counts: any = {
    rcn: 0, boiling: 0, cutting: 0, kernel: 0,
    peeling: 0, sorting: 0, packing: 0, sales: 0
  };

  constructor(private svc: BatchDataService) {}

  ngOnInit() {
    this.svc.rcn$.subscribe(v => this.counts.rcn = v.length);
    this.svc.boiling$.subscribe(v => this.counts.boiling = v.length);
    this.svc.cutting$.subscribe(v => this.counts.cutting = v.length);
    this.svc.kernel$.subscribe(v => this.counts.kernel = v.length);
    this.svc.peeling$.subscribe(v => this.counts.peeling = v.length);
    this.svc.sorting$.subscribe(v => this.counts.sorting = v.length);
    this.svc.packing$.subscribe(v => this.counts.packing = v.length);
    this.svc.sales$.subscribe(v => this.counts.sales = v.length);
  }

  toggleStage(stage: string) {
    this.expandedStage = this.expandedStage === stage ? null : stage;
  }
}
