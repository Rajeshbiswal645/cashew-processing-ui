import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { BatchesRoutingModule } from './batches-routing.module';
import { BatchesComponent } from './batches.component';
import { BoilingComponent } from './boiling/boiling.component';
import { CuttingComponent } from './cutting/cutting.component';
import { KernelComponent } from './kernel/kernel.component';
import { PeelingComponent } from './peeling/peeling.component';
import { SortingComponent } from './sorting/sorting.component';
import { PackingComponent } from './packing/packing.component';
import { PipelineComponent } from './pipeline/pipeline.component';
import { BatchDetailComponent } from './batch-detail/batch-detail.component';
import { RcnListComponent } from './rcn/rcn-list.component';


@NgModule({
  declarations: [
    BatchesComponent,
    BoilingComponent,
    CuttingComponent,
    KernelComponent,
    PeelingComponent,
    SortingComponent,
    PackingComponent,
    PipelineComponent,
    BatchDetailComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    BatchesRoutingModule,
    RcnListComponent
  ],
  exports: [
    BoilingComponent,
    CuttingComponent,
    KernelComponent,
    PeelingComponent,
    SortingComponent,
    PackingComponent,
    PipelineComponent,
    BatchDetailComponent
  ]
})
export class BatchesModule { }
